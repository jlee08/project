import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Main Section */}
      <motion.section
        className="relative h-[500px] md:h-[720px] bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/main-sec.png')`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center px-4 md:px-5">
          <div className="text-center text-white max-w-4xl">
            <motion.h1
              className="text-4xl md:text-6xl lg:text-8xl font-serif font-light mb-4 md:mb-6 leading-none tracking-wide"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Cosmotree
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl lg:text-2xl font-light leading-relaxed tracking-wide px-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              Web-Based Astronomy Learning Platform for Youth Engagement and Exploration
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Why Cosmotree Section */}
      <motion.section
        className="py-16 md:py-25 px-4 md:px-0 bg-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* Section Header */}
          <motion.div
            className="mb-12 md:mb-17"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-gowun font-normal leading-none tracking-tight text-black">
              Why Cosmotree?
            </h2>
          </motion.div>

          {/* Key Value Points Card */}
          <motion.div
            className="bg-white rounded-2xl p-4 mb-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-sm md:text-base font-rethink text-amber-900 mb-4 md:mb-6 text-center leading-tight tracking-tight">
              Key Value Points
            </h3>
            <p className="text-xl md:text-2xl lg:text-3xl font-gowun text-black text-center leading-relaxed tracking-tight px-4">
              accessibility, self-paced curriculum, real-world connection, collaborative learning
            </p>
          </motion.div>

          {/* Three Feature Cards */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 w-full max-w-[1102px]">
              {/* Card 1 */}
              <motion.div
                className="bg-white border border-gray-300 rounded-2xl shadow-lg flex flex-col justify-center items-center gap-6 md:gap-10 px-5 py-6 md:py-0 h-auto md:h-[298px]"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-sm md:text-base font-rethink text-amber-900 leading-tight tracking-tight">
                  1.
                </div>
                <h4 className="text-xl md:text-2xl lg:text-3xl font-gowun text-black leading-relaxed tracking-tight text-center">
                  Structured Learning Modules
                </h4>
                <p className="text-sm md:text-base font-rethink text-black leading-tight tracking-tight text-center">
                  Lorem ipsum dolor sit amet consectetur. Integer risus mattis eget sed porttitor
                  risus fermentum blandit.
                </p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                className="bg-white border border-gray-300 rounded-2xl shadow-lg flex flex-col justify-center items-center gap-6 md:gap-10 px-5 py-6 md:py-0 h-auto md:h-[298px]"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-sm md:text-base font-rethink text-amber-900 leading-tight tracking-tight">
                  2.
                </div>
                <h4 className="text-xl md:text-2xl lg:text-3xl font-gowun text-black leading-relaxed tracking-tight text-center">
                  Interactive Quizzes
                </h4>
                <p className="text-sm md:text-base font-rethink text-black leading-tight tracking-tight text-center">
                  Engage with interactive astronomy quizzes to test your knowledge and reinforce
                  learning concepts.
                </p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                className="bg-white border border-gray-300 rounded-2xl shadow-lg flex flex-col justify-center items-center gap-6 md:gap-10 px-5 py-6 md:py-0 h-auto md:h-[298px] md:col-span-1 lg:col-span-1"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-sm md:text-base font-rethink text-amber-900 leading-tight tracking-tight">
                  3.
                </div>
                <h4 className="text-xl md:text-2xl lg:text-3xl font-gowun text-black leading-relaxed tracking-tight text-center">
                  Virtual Observatory
                </h4>
                <p className="text-sm md:text-base font-rethink text-black leading-tight tracking-tight text-center">
                  Explore the cosmos through our virtual observatory with real astronomical data and
                  imagery.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section
        className="flex justify-center mb-12 md:mb-20 px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-[1341px] h-auto lg:h-[464px]">
          {/* Left side - Image */}
          <motion.div
            className="bg-cover bg-center bg-gray-200 rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none h-64 lg:h-auto"
            style={{
              backgroundImage: `url('/images/main-sec-01.png')`,
            }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          ></motion.div>

          {/* Right side - Content */}
          <motion.div
            className="rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none flex flex-col justify-center items-center gap-6 lg:gap-10 p-6 lg:p-8 min-h-[300px] lg:min-h-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.h3
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-gowun text-black text-center leading-none tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Start Your Cosmic Journey Today
            </motion.h3>
            {/* 버튼 클릭 시 /auth/signup 페이지로 이동합니다 */}
            <motion.button
              className="bg-transparent text-black px-4 md:px-6 py-2 md:py-3 rounded-lg text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-gowun leading-none tracking-tight hover:bg-black hover:text-white transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              whileHover={{
              scale: 1.05,
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
              // 회원가입 페이지로 이동합니다
              window.location.href = '/auth/signup';
              }}
            >
              Join Us
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
