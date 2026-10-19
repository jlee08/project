"""Gradio Space for OpenMOSS-Team/MOSS-Image-Base (text-to-image, ZeroGPU)."""
import json
import math
import random

import gradio as gr
import spaces
import torch
from diffusers import DiffusionPipeline

MODEL_ID = "OpenMOSS-Team/MOSS-Image-Base"
MAX_SEED = 2**32 - 1
DEFAULT_NEGATIVE = "nsfw, worst quality, bad anatomy, watermark, jpeg artifact"

# Pixel budgets and aspect ratios recommended by the official guide (1M–2M pixels work best).
PIXEL_BUDGETS = {"0.25M (512²)": 262144, "1M (1024²)": 1048576, "1.5M": 1572864, "2M": 2097152}
RATIOS = ["9:16", "2:3", "3:4", "1:1", "4:3", "3:2", "16:9", "1:2", "2:1"]

pipe = DiffusionPipeline.from_pretrained(
    MODEL_ID,
    custom_pipeline="pipeline_moss_image",
    trust_remote_code=True,
    torch_dtype={"default": torch.bfloat16, "vae": torch.float32},
)
pipe.to("cuda")
NUM_LAYERS = pipe.transformer.config.num_layers
BASE_SCHEDULER_CONFIG = dict(pipe.scheduler.config)


def fit_size(pixels: int, ratio: str) -> tuple[int, int]:
    """Width/height for a pixel budget and aspect ratio, snapped to multiples of 16."""
    w, h = map(float, ratio.split(":"))
    r = w / h
    width, height = math.sqrt(pixels * r), math.sqrt(pixels / r)
    return tuple(max(16, round(edge / 16) * 16) for edge in (width, height))


def parse_layers(text: str) -> tuple[int, ...]:
    text = (text or "").strip()
    if not text:
        return ()
    try:
        layers = tuple(int(x.strip()) for x in text.split(","))
    except ValueError:
        raise gr.Error("Skip layers must be comma-separated integers, e.g. 22")
    if any(l < 0 or l >= NUM_LAYERS for l in layers):
        raise gr.Error(f"Skip layers must be between 0 and {NUM_LAYERS - 1}.")
    return layers


def update_size(budget: str, ratio: str):
    width, height = fit_size(PIXEL_BUDGETS[budget], ratio)
    return width, height


def gpu_duration(prompt, negative_prompt, width, height, steps, cfg, shift, skip_layers, seed, randomize_seed,
                 progress=None):
    # Roughly scale ZeroGPU time with work done; CFG roughly doubles the cost.
    work = (int(width) * int(height) / 1048576) * int(steps) * (2 if cfg > 1 else 1)
    return int(min(300, 30 + work * 0.9))


@spaces.GPU(duration=gpu_duration)
def generate(prompt, negative_prompt, width, height, steps, cfg, shift, skip_layers, seed, randomize_seed,
             progress=gr.Progress(track_tqdm=True)):
    if not prompt or not prompt.strip():
        raise gr.Error("Enter a prompt.")
    width, height = int(width), int(height)
    if width % 16 or height % 16:
        raise gr.Error("Width and height must be multiples of 16.")
    if randomize_seed:
        seed = random.randint(0, MAX_SEED)
    seed = int(seed)

    pipe.scheduler = type(pipe.scheduler).from_config(BASE_SCHEDULER_CONFIG, shift=float(shift))
    image = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt or "",
        width=width,
        height=height,
        num_inference_steps=int(steps),
        guidance_scale=float(cfg),
        max_sequence_length=4096,
        uncond_skip_layers=parse_layers(skip_layers),
        generator=torch.Generator("cpu").manual_seed(seed),
    ).images[0]
    return image, seed


LAYOUT_EXAMPLE = json.dumps(
    {
        "summary": {
            "meta": ["poster"],
            "canvas": "single",
            "caption": "A minimalist travel poster with a cream background, a blue mountain illustration, "
            "and the title EXPLORE at the top.",
        },
        "items": [
            {
                "label": "text",
                "caption": "Large dark-blue uppercase title centered at the top.",
                "text": "EXPLORE",
                "bbox": [-416, -384, -288, 384],
            },
            {
                "label": "object",
                "caption": "A flat blue mountain illustration in the lower center.",
                "bbox": [-192, -288, 384, 288],
            },
        ],
        "bbox_coord_space": "abs_centralized",
        "bbox_format": "yxyx",
    },
    indent=2,
)

EXAMPLES = [
    [
        "A wide view of a refrigerator beside a kitchen counter with a fruit bowl. A small sticky note on the "
        "refrigerator door is handwritten in Chinese:\n“记得买牛奶和鸡蛋！\n牛奶两盒，鸡蛋一打。\n顺便带一袋面包。”",
        "", 1456, 1456,
    ],
    [
        "best quality, masterpiece, a cozy bookshop storefront on a rainy evening, warm light spilling onto wet "
        "cobblestones, a hand-painted wooden sign above the door reads \"THE QUIET PAGE\"",
        DEFAULT_NEGATIVE, 1344, 768,
    ],
    [LAYOUT_EXAMPLE, DEFAULT_NEGATIVE, 1024, 1024],
    [
        "best quality, highres, 1girl, silver hair, school uniform, cherry blossoms, spring, soft lighting, "
        "looking at viewer, smile",
        DEFAULT_NEGATIVE, 832, 1216,
    ],
]

with gr.Blocks(title="MOSS-Image-Base") as demo:
    gr.Markdown(
        "# MOSS-Image-Base\n"
        "Text-to-image with [OpenMOSS-Team/MOSS-Image-Base](https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base): "
        "a 5B DiT that handles long prompts, English/Chinese text rendering and **JSON layouts** "
        "(paste a layout into the prompt and match width/height to its canvas). "
        "[Code](https://github.com/OpenMOSS/MOSS-Image) · "
        "[User guide](https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md)"
    )
    with gr.Row():
        with gr.Column(scale=1):
            prompt = gr.Textbox(label="Prompt", lines=6, placeholder="Describe the image, or paste a JSON layout…")
            negative_prompt = gr.Textbox(label="Negative prompt", value=DEFAULT_NEGATIVE, lines=2)
            run = gr.Button("Generate", variant="primary")
            with gr.Row():
                budget = gr.Dropdown(list(PIXEL_BUDGETS), value="1M (1024²)", label="Resolution")
                ratio = gr.Dropdown(RATIOS, value="1:1", label="Aspect ratio")
            with gr.Row():
                width = gr.Slider(256, 2048, value=1024, step=16, label="Width")
                height = gr.Slider(256, 2048, value=1024, step=16, label="Height")
            with gr.Accordion("Advanced settings", open=False):
                steps = gr.Slider(10, 80, value=50, step=1, label="Steps (≥50 recommended)")
                cfg = gr.Slider(1.0, 8.0, value=3.0, step=0.1, label="CFG (3–6 recommended; raise for short prompts)")
                shift = gr.Slider(1.0, 10.0, value=5.0, step=0.1, label="Shift")
                skip_layers = gr.Textbox(
                    value="22", label="Negative-branch skip layers",
                    info="Comma-separated, 0-indexed. 22 is recommended; clear to disable.",
                )
                with gr.Row():
                    seed = gr.Number(value=42, precision=0, label="Seed")
                    randomize_seed = gr.Checkbox(value=True, label="Randomize seed")
        with gr.Column(scale=1):
            result = gr.Image(label="Result", format="png")
            used_seed = gr.Number(label="Seed used", interactive=False)

    for control in (budget, ratio):
        control.change(update_size, [budget, ratio], [width, height], queue=False)

    gr.Examples(examples=EXAMPLES, inputs=[prompt, negative_prompt, width, height])

    inputs = [prompt, negative_prompt, width, height, steps, cfg, shift, skip_layers, seed, randomize_seed]
    gr.on([run.click, prompt.submit], generate, inputs, [result, used_seed])

if __name__ == "__main__":
    demo.queue().launch()
