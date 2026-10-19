---
title: MOSS-Image-Base
emoji: 🌿
colorFrom: indigo
colorTo: green
sdk: gradio
sdk_version: 6.30.0
app_file: app.py
pinned: false
license: apache-2.0
short_description: Text-to-image demo for OpenMOSS MOSS-Image-Base (5B DiT)
models:
  - OpenMOSS-Team/MOSS-Image-Base
tags:
  - text-to-image
  - diffusers
---

# MOSS-Image-Base demo

A Gradio demo for [OpenMOSS-Team/MOSS-Image-Base](https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base),
a 5B diffusion transformer with a Qwen3.5 text encoder and a FLUX.2 VAE.
It is good at text rendering (English and Chinese), long prompts (up to 4K tokens)
and JSON layout control.

Runs on **ZeroGPU**. Defaults follow the official
[user guide](https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md):
50 Euler steps, CFG 3, shift 5, negative-branch layer skipping at layer 22.

Code: [github.com/OpenMOSS/MOSS-Image](https://github.com/OpenMOSS/MOSS-Image) ·
Paper: [arXiv 2610.23374](https://arxiv.org/abs/2610.23374)
