# 🚀 Meme Factory D²

Meme Factory D² is a fun and interactive web application built with React that allows you to create custom memes! Choose from a selection of popular meme templates, upload your own image, add and customize text fields, and then download your masterpiece.

---

## Author's Note

This project was initially created on Scrimba 's React course and has been modified to include additional features and functionality. It's my first React project and thanks to my friend for testing and giving me suggestions. Hope you all will enjoy it! The D^2 in the name stands for my name.

## ✨ Features

* **Diverse Meme Templates:** Browse and select from a wide range of popular meme templates fetched from a public API.
* **Custom Image Upload:** Upload your own image to use as a meme background.
* **Draggable Text Fields:** Add multiple text fields to your meme canvas, which can be dragged and positioned freely.
* **Text Customization:**
    * Change text content.
    * Select from various Google Fonts.
    * Adjust font size using a slider.
    * Pick any text color.
* **Download Your Meme:** Generate and download your created meme as a PNG image.
* **Responsive Design:** Enjoy a smooth experience across different screen sizes.

---

## 🛠️ Technologies Used

* **React:** A JavaScript library for building user interfaces.
* **Vite:** A fast and modern build tool for frontend development.
* **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
* **GSAP (GreenSock Animation Platform):**
    * `gsap.min.js`: For high-performance animations (though primarily used for `Draggable` here).
    * `Draggable.min.js`: Enables the draggable functionality for text fields.
* **html2canvas:** A JavaScript library that allows you to take "screenshots" of webpages or parts of them, which is used here to convert the meme canvas into an image for download.
* **Imgflip API:** Used to fetch a variety of meme templates.
* **Google Fonts & Material Icons:** For a wider selection of fonts and intuitive icons.

---

## 🚦 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and npm (or Yarn, or pnpm) installed on your system.

* **Node.js**: [Download & Install Node.js](https://nodejs.org/en/download/) (which includes npm)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/meme-factory-d2.git](https://github.com/YOUR_USERNAME/meme-factory-d2.git)
    cd meme-factory-d2
    ```
    *(**Note:** Replace `YOUR_USERNAME/meme-factory-d2` with your actual GitHub repository URL after you push your code.)*

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Running the application

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
2.  Open your browser and navigate to the address shown in your terminal (usually `http://localhost:5173`).

---

## 📦 Deployment

This project is a static site (client-side React application). It can be easily deployed to various static hosting providers.

### Build for Production

First, generate the production-ready build files:

```bash
npm run build
# or
yarn build
# or
pnpm build
````

This command will create a `dist` folder in your project root, containing all the optimized HTML, CSS, and JavaScript files ready for deployment.

### Recommended Deployment Platforms

  * **Vercel (Highly Recommended):**
      * Connect your Git repository to Vercel. Vercel will automatically detect it as a Vite project and configure the build command (`npm run build`) and output directory (`dist`).
      * Every push to your main branch will trigger an automatic deployment.
  * **Netlify:**
      * Similar to Vercel, connect your Git repository. Netlify will auto-detect Vite and set up the build.
  * **GitHub Pages:**
      * Requires configuring the `base` option in `vite.config.js` if deploying to a subpath.
      * You can use the `gh-pages` package to automate deployment.

-----

## 📄 License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).

-----

## 🙌 Acknowledgements

  * **Imgflip API:** For providing meme templates.
  * **html2canvas:** For enabling the meme download functionality.
  * **GSAP & Draggable:** For the intuitive draggable text fields.
  * **Google Fonts & Material Icons:** For enhancing the UI.