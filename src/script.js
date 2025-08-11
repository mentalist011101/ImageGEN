const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const modelSelect = document.getElementById("model-select");
const imageCountSelect = document.getElementById("image-count-select");
const aspectRatioSelect = document.getElementById("aspect-ratio-select");
const gridGallery = document.querySelector(".gallery-grid");
// Add a constant HF_TOKEN with your HuggingFace API Key


const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "A serene landscape with mountains and a lake",
    "A futuristic city skyline at sunset",
    "A cozy cabin in the woods during winter",
    "A vibrant underwater scene with colorful fish",
    "A fantasy castle on a hill under a starry sky",
    "A bustling market street in a medieval town",
    "A close-up of a blooming flower in spring",
    "A majestic eagle soaring over a canyon",
    "A peaceful beach with palm trees and clear water",
    "A dramatic thunderstorm over a desert landscape"];
// Switch between light and dark themes
(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDarkTheme = savedTheme === "dark" || (!savedTheme  && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize=512) => {
    const [widthRatio, heightRatio] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(widthRatio * heightRatio);

    let width = Math.round(widthRatio * scaleFactor);
    let height = Math.round(heightRatio * scaleFactor);

    width = Math.floor(width / 16) * 16; // Ensure width is a multiple of 16
    height = Math.floor(height / 16) * 16; // Ensure height is a multiple of 16

    return { width:width, height:height };

}

generatedImages = async (model, count, aspectRatio, prompt) => {
    //const MODEL_URL = `https://api-inference.huggingface.co/hf-inference/models/${model}`;
    const MODEL_URL = `https://api-inference.huggingface.co/models/${model}`;
    const { width, height } = getImageDimensions(aspectRatio);

    const imagePromises = Array.from({length: count}, async (_, i) => {
    try {
        const response = await fetch(MODEL_URL, {
            headers: {
				Authorization: `Bearer ${HF_TOKEN}`,
				"Content-Type": "application/json",
                "x-use-cache": "false",
			},
			method: "POST",
			body: JSON.stringify({
                inputs: prompt,
                parameters:{width, height},
                options:{wait_for_model: true, user_cache:false},
            }),
        });
        if (!response.ok) throw new Error((await response.json())?.error);

        const result = await response.blob();
        console.log(result);
    }catch (error) {
        console.log(error);
    }

    });
    await Promise.allSettled(imagePromises);
}

const createImageCards = (model, count, aspectRatio, prompt) => {
gridGallery.innerHTML = ""; // Clear existing cards

    for (let i=0; i<count; i++) {
        gridGallery.innerHTML += `<div class="img-card  loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio};">
                        <div class="status-container">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p class="status-text">Generating...</p>
                        </div>
                        <img src="" class="result-img"/>
  
                    </div>`;
    }
    generatedImages(model, count, aspectRatio, prompt);
}


const handleFormSubmit = (event) => {
    event.preventDefault();
    
    const selectedModel = modelSelect.value;
    const imageCount = parseInt(imageCountSelect.value) || 1;
    const aspectRatio = aspectRatioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

   createImageCards(selectedModel, imageCount, aspectRatio, promptText);
}


promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
});


promptForm.addEventListener("submit", handleFormSubmit);

themeToggle.addEventListener("click", toggleTheme);
