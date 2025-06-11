import React, { useState, useEffect, useRef, memo } from "react";

// --- Configuration ---
const SCRIPT_URLS = [
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Draggable.min.js"
];
const FONT_OPTIONS = ["Anton", "Bangers", "Oswald", "Luckiest Guy", "Roboto", "Pacifico", "Caveat", "Lobster"];
const INITIAL_IMAGE_URL = "https://i.imgflip.com/1bij.jpg";

// --- Utility Hooks & Components ---

/**
 * Custom hook to dynamically load external scripts and track their loading status.
 * @param {string[]} scripts - Array of script URLs to load.
 * @returns {boolean} - True if all scripts are loaded, false otherwise.
 */
const useScriptLoader = (scripts) => {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                // Resolve immediately if script already exists
                if (document.querySelector(`script[src="${src}"]`)) {
                    return resolve();
                }
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Script load error for ${src}`));
                document.body.appendChild(script);
            });
        };

        // Load all scripts in parallel
        Promise.all(scripts.map(loadScript))
            .then(() => setLoaded(true))
            .catch(error => console.error("Failed to load scripts:", error));
    }, []); // Empty dependency array ensures this runs only once.

    return loaded;
};

/**
 * Component to inject Google Fonts and Material Icons stylesheets into the document head.
 */
const GoogleAssetsLoader = memo(({ fonts }) => (
    <>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f.replace(/ /g, '+')}:wght@400;700;900`).join('&')}&display=swap`}
        />
        <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined"
        />
    </>
));

// --- Main App Component ---
export default function App() {
    // --- Refs and State ---
    const memeRef = useRef(null);
    const imageRef = useRef(null);
    const draggableInstancesRef = useRef([]);
    const librariesLoaded = useScriptLoader(SCRIPT_URLS);

    const [allMemes, setAllMemes] = useState([]);
    const [meme, setMeme] = useState({ imageUrl: INITIAL_IMAGE_URL });
    const [fields, setFields] = useState([
    { id: 1, text: "One does not simply", font: "Anton", color: "#ffffff", size: 40, x: 100, y: 50 },
    { id: 2, text: "Fix a bug on Friday", font: "Anton", color: "#ffffff", size: 40, x: 100, y: 300 }
]);
    const [activeFieldId, setActiveFieldId] = useState(null);
    const [activePanel, setActivePanel] = useState("templates");

    // --- Effects ---

    // Fetch meme templates from API
    useEffect(() => {
        fetch("https://api.imgflip.com/get_memes")
            .then((res) => res.json())
            .then((data) => setAllMemes(data.data.memes))
            .catch(err => console.error("Failed to fetch memes:", err));
    }, []);

    // Initialize Draggable text fields
     useEffect(() => {
        if (!librariesLoaded) return;
        
        window.gsap.registerPlugin(window.Draggable);

        // Kill existing instances
        draggableInstancesRef.current.forEach(d => d.kill());
        draggableInstancesRef.current = [];

        // Create new instances and store them in the ref
        fields.forEach((field, index) => {
            const newDraggable = window.Draggable.create(`.draggable-${index}`, {
                type: "left,top",
                bounds: memeRef.current,
                onClick: () => setActiveFieldId(field.id),
                onDragEnd: function() {
                    // Use functional state update to avoid stale state
                    setFields(currentFields => 
                        currentFields.map(item => 
                            item.id === field.id ? { ...item, x: this.x, y: this.y } : item
                        )
                    );
                }
            });
            draggableInstancesRef.current.push(newDraggable[0]);
        });

        // Cleanup function to kill instances when component unmounts
        return () => {
            draggableInstancesRef.current.forEach(d => d.kill());
        };
        
    }, [fields.length, meme.imageUrl, librariesLoaded]);

    // --- Event Handlers ---
    const handleSelectMeme = (url) => {
        setMeme({ imageUrl: url });
        setActiveFieldId(null);
    };

    const handleRandomMeme = () => {
        if (!allMemes.length) return;
        const randomUrl = allMemes[Math.floor(Math.random() * allMemes.length)].url;
        handleSelectMeme(randomUrl);
    };

    const handleAddField = () => {
        const newField = { id: Date.now(), text: "New Text", font: "Anton", color: "#ffffff", size: 40, x: 150, y: 150 };
        setFields([...fields, newField]);
        setActiveFieldId(newField.id);
    };

    const handleFieldChange = (id, key, value) => {
        setFields(fields.map(field => field.id === id ? { ...field, [key]: value } : field));
    };

    const handleDeleteField = (id) => {
        setFields(fields.filter(field => field.id !== id));
        if (activeFieldId === id) setActiveFieldId(null);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setMeme({ imageUrl: reader.result });
        reader.readAsDataURL(file);
        setActiveFieldId(null);
    };

    const handleDownloadMeme = () => {
        if (!window.html2canvas) return console.error("html2canvas not loaded");
        setActiveFieldId(null); // Hide selection box before capture
        setTimeout(() => {
            if (!memeRef.current) return;
            window.html2canvas(memeRef.current, { useCORS: true, backgroundColor: null, logging: false })
                .then((canvas) => {
                    const link = document.createElement("a");
                    link.download = `meme-${Date.now()}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                })
                .catch(err => console.error("Canvas capture error:", err));
        }, 150);
    };

    const handleCanvasClick = (e) => {
        // Deselect field if clicking on canvas background, not on a text element
        if (e.target === imageRef.current || e.target === memeRef.current) {
             setActiveFieldId(null);
        }
    }

    const activeField = fields.find(f => f.id === activeFieldId);

    // --- Render Logic ---

    // Display loading screen until external libraries are ready
    if (!librariesLoaded) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white gap-4">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
                <h2 className="text-xl font-semibold text-gray-300">Loading ...</h2>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-gray-900 text-white font-sans antialiased">
            <GoogleAssetsLoader fonts={FONT_OPTIONS} />
            
            <header className="flex items-center justify-between bg-gray-800 px-4 py-2 shadow-md z-20">
                <div className="flex items-center gap-3">
                    <span className="material-icons text-purple-400 text-3xl">emoji_emotions</span>
                    <h1 className="text-xl font-bold text-gray-200">Meme Factory D<sup>2</sup></h1>
                </div>
                <button onClick={handleDownloadMeme} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400">
                    <span className="material-icons">download</span>
                    <span>Download</span>
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-20 bg-gray-800 p-2 flex flex-col items-center gap-4">
                    <SidebarButton icon="grid_view" label="Templates" active={activePanel === 'templates'} onClick={() => setActivePanel('templates')} />
                    <SidebarButton icon="cloud_upload" label="Uploads" active={activePanel === 'uploads'} onClick={() => setActivePanel('uploads')} />
                    <SidebarButton icon="title" label="Text" active={activePanel === 'text'} onClick={() => setActivePanel('text')} />
                </aside>

                <div className="w-80 bg-gray-800/50 p-4 overflow-y-auto custom-scrollbar">
                    {activePanel === 'templates' && <TemplatePanel memes={allMemes} onSelect={(url) => handleSelectMeme(url)} onRandom={handleRandomMeme} />}
                    {activePanel === 'uploads' && <UploadPanel onUpload={handleImageUpload} />}
                    {activePanel === 'text' && <TextPanel onAddField={handleAddField} />}
                </div>

                <main className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
                    {activeField && <ContextualToolbar field={activeField} onChange={handleFieldChange} onDelete={handleDeleteField} />}
                    
                    <section className="flex-1 flex justify-center items-center p-8" onClick={handleCanvasClick}>
                        <div ref={memeRef} className="relative bg-black shadow-lg overflow-hidden select-none">
                           <img ref={imageRef} src={meme.imageUrl} alt="Meme template" crossOrigin="anonymous" className="block max-w-full max-h-[80vh] object-contain" onError={(e) => e.target.src = 'https://placehold.co/600x400/000000/FFFFFF?text=Image+Not+Found'} />
                            {fields.map((field, index) => (
                                <div key={field.id} className={`draggable-text draggable-${index} absolute cursor-move`} style={{ left: field.x, top: field.y }}>
                                    <div className={`whitespace-nowrap transition-all duration-150 p-2 ${activeFieldId === field.id ? 'border-2 border-dashed border-purple-500' : 'border-2 border-dashed border-transparent'}`} style={{ fontFamily: `'${field.font}', sans-serif`, fontSize: `${field.size}px`, color: field.color, WebkitTextStroke: `2px black`, textStroke: `2px black`, paintOrder: 'stroke fill', fontWeight: '900' }}>
                                        {field.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

// --- UI Sub-Components ---
const SidebarButton = memo(({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 rounded-lg w-full aspect-square transition-colors ${active ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`} title={label}>
        <span className="material-icons text-3xl">{icon}</span>
        <span className="text-xs mt-1">{label}</span>
    </button>
));

const TemplatePanel = memo(({ memes, onSelect, onRandom }) => (
    <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="material-icons-outlined">collections</span> Templates</h2>
        <button onClick={onRandom} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mb-4 flex items-center justify-center gap-2"><span className="material-icons">casino</span>Random Meme</button>
        <div className="grid grid-cols-2 gap-2">
            {memes.map(meme => (
                <img key={meme.id} src={meme.url} alt={meme.name} onClick={() => onSelect(meme.url)} className="w-full h-auto object-cover rounded-md cursor-pointer hover:ring-2 ring-purple-500 transition-all" />
            ))}
        </div>
    </div>
));

const UploadPanel = memo(({ onUpload }) => (
    <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="material-icons-outlined">photo_library</span>Upload Image</h2>
        <label htmlFor="upload-input" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mb-4 flex items-center justify-center gap-2 cursor-pointer">
            <span className="material-icons">cloud_upload</span><span>Choose a file</span>
        </label>
        <input id="upload-input" type="file" accept="image/*" onChange={onUpload} className="hidden" />
        <p className="text-sm text-gray-400">Upload your own background image to create a custom meme.</p>
    </div>
));

const TextPanel = memo(({ onAddField }) => (
    <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="material-icons-outlined">edit</span>Add Text</h2>
        <button onClick={onAddField} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
            <span className="material-icons">add</span><span>Add New Text</span>
        </button>
        <p className="text-sm text-gray-400 mt-4">Click to add a new draggable text field to your meme canvas.</p>
    </div>
));

const ContextualToolbar = memo(({ field, onChange, onDelete }) => {
    useEffect(() => {
      if (window.gsap) {
          window.gsap.fromTo(".contextual-toolbar", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
      }
    }, [field.id]);
    
    return (
        <div className="contextual-toolbar flex items-center gap-x-4 gap-y-2 bg-gray-800 p-2 shadow-lg z-10 justify-center flex-wrap" onClick={e => e.stopPropagation()}>
            <input type="text" value={field.text} onChange={(e) => onChange(field.id, "text", e.target.value)} className="bg-gray-700 text-white p-2 rounded-md w-64 focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="Enter text..." />
            <select value={field.font} onChange={(e) => onChange(field.id, "font", e.target.value)} className="bg-gray-700 text-white p-2 rounded-md appearance-none focus:ring-2 focus:ring-purple-500 focus:outline-none" style={{ fontFamily: `'${field.font}', sans-serif` }}>
                {FONT_OPTIONS.map(font => <option key={font} value={font} style={{ fontFamily: `'${font}', sans-serif` }}>{font}</option>)}
            </select>
            <div className="flex items-center gap-2">
                <input type="range" min="10" max="120" value={field.size} onChange={(e) => onChange(field.id, "size", parseInt(e.target.value))} className="w-32" />
                <span className="text-sm w-8 text-center">{field.size}px</span>
            </div>
            <input type="color" value={field.color} onChange={(e) => onChange(field.id, "color", e.target.value)} className="w-10 h-10 p-1 bg-gray-700 rounded-md cursor-pointer border-none" title="Change text color" />
            <button onClick={() => onDelete(field.id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md flex items-center" title="Delete text field">
                <span className="material-icons">delete</span>
            </button>
        </div>
    );
});