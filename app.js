const notesDiv = document.querySelector(".notes-container");
const downloadBtn = document.querySelector(".downloadBtn");
const addBtn = document.querySelector(".addBtn");
let notes = [];


async function createNote(noteData) {
  try {
    const fetchNote = await fetch('note.html');
    const noteHTML = await fetchNote.text();

    // converting HTML string into actual DOM elements
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = noteHTML.trim();
    const noteElement = tempDiv.firstElementChild;

    const titleElement = noteElement.querySelector(".note-title");
    const bulletBtn = noteElement.querySelector(".btn-bullet");
    const textareaEl = noteElement.querySelector("textarea");
    const deleteBtn = noteElement.querySelector(".btn-delete");

    // Use default values if none passed
    const data = {
      id: noteData?.id || Date.now(),
      title: noteData?.title || "",
      content: noteData?.content || ""
    };

    titleElement.textContent = data.title;
    textareaEl.value = data.content;

    notesDiv.appendChild(noteElement);
    textareaEl.focus();

    // Add functionality
    bulletBtn.addEventListener("click", () => {
      textareaEl.value += "\n• ";
      textareaEl.focus();
      handleChange();
    });

    deleteBtn.addEventListener("click", () => {
      noteElement.remove();
      notes = notes.filter(n => n.id !== data.id);
      autoSave();
    });

    const handleChange = () => {
      data.title = titleElement.textContent.trim();
      data.content = textareaEl.value;
      const existingIndex = notes.findIndex(n => n.id === data.id);
      if (existingIndex >= 0) notes[existingIndex] = data;
      else notes.push(data);
      autoSave();
    };

    titleElement.addEventListener("input", handleChange);
    textareaEl.addEventListener("input", handleChange);

    // Only push if not already in array
    if (!notes.some(n => n.id === data.id)) notes.push(data);
    autoSave();

  } catch (error) {
    console.error("Error loading note container: ", error);
  }
}



function autoSave () {
    localStorage.setItem("noted-app-notes", JSON.stringify(notes));
}

function loadNotes () {
    const savedNotes = JSON.parse(localStorage.getItem("noted-app-notes") || "[]");
    notes = [];
    savedNotes.forEach(note => createNote(note) );
}

function downloadNotes () {
  let allNotesOnApp = notes
    .map((n, i) => `Note ${i + 1}: ${n.title}\n${n.content}\n\n`)
    .join("");

  const blob = new Blob([allNotesOnApp], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "My_Noted.txt";
  a.click();
  URL.revokeObjectURL(url);
}

// Keyboard shortcut: Ctrl + = to create a new note
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && (event.key === "=" || event.key === "+")) {
    event.preventDefault(); // prevent any browser zoom shortcut
    createNote(); // call your existing note creation function
  }
});

// Add “Download All” Button to UI
downloadBtn.addEventListener("click", downloadNotes);
addBtn.addEventListener("click", createNote);
loadNotes();

