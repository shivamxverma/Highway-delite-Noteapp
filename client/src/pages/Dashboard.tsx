import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { getNotes,createNote } from '../api/api';
import { useAuth } from '../auth/AuthContext';

interface Note {
  id: number;
  title: string;
  description: string;
}

interface FormData {
  title: string;
  description: string;
}

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title can't exceed 100 characters" }),
  description: z.string().min(1, { message: "Description is required" }).max(500, { message: "Description can't exceed 500 characters" }),
});

type FormSchemaType = z.infer<typeof formSchema>;

const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, title: "Note 1", description: "Description 1" },
    { id: 2, title: "Note 2", description: "Description 2" },
  ]);
  const { accessToken } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({ title: "", description: "" });
  const [errors, setErrors] = useState<Record<keyof FormData, string>>({ title: "", description: "" });


  useEffect(() => {
    async function fetchNotes() {
      if (accessToken) {
        try {
          const response = await getNotes(accessToken);
          console.log("Fetched notes:", response.data.notes);
          setNotes(response.data.notes);
        } catch (error) {
          console.error("Failed to fetch notes:", error);
        }
      } else {
        console.error("Access token is missing.");
      }
    }
    fetchNotes();
  },[])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateNote = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setFormData({ title: "", description: "" });
    setErrors({ title: "", description: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    const validation = formSchema.shape[id as keyof FormSchemaType].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [id]: validation.success ? "" : validation.error.issues[0].message,
    }));
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    const validation = formSchema.safeParse(formData);
    if (validation.success) {
      try {
        if(accessToken){
          const response = await createNote(accessToken, formData.title, formData.description)
          console.log("Note created:", response.data.note);
          setNotes([...notes, response.data.note]);
          handleClosePopup();
        }
      } catch (error) {
        console.error("An error occurred while creating the note:", error);
      }
    } else {
      const newErrors: Record<keyof FormData, string> = { title: "", description: "" };
      validation.error.issues.forEach((error) => {
        newErrors[error.path[0] as keyof FormData] = error.message;
      });
      setErrors(newErrors);
    }
  };

  const handleSignOut = () => {
    alert("Signed out successfully!");
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className={`min-h-screen ${isMobile ? 'bg-white' : 'bg-gray-100'}`}>
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <div className="flex items-center">
          <span className="text-blue-600 text-2xl mr-2">🌐</span>
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <button
          className="text-blue-500 hover:underline"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </header>
      <main className="p-4">
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold">Welcome, Jonas Kahnwald!</h2>
          <p className="text-gray-500">Email: xxxxx@xxxx.com</p>
        </div>
        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={handleCreateNote}
        >
          Create Note
        </button>
        <div>
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-center justify-between bg-white p-2 rounded shadow mb-2"
            >
              <div>
                <span className="font-medium">{note.title}</span>
                <p className="text-sm text-gray-600">{note.description}</p>
              </div>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDeleteNote(note.id)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </main>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Note</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.title ? "border-red-500" : ""}`}
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                />
                {errors.title && <p className="text-red-500 text-xs italic">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.description ? "border-red-500" : ""}`}
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                />
                {errors.description && <p className="text-red-500 text-xs italic">{errors.description}</p>}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  onClick={handleClosePopup}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;