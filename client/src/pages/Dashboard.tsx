import React, { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { getNotes, createNote, deleteNote } from '../api/api';
import { useAuth } from '../auth/AuthContext';

interface Note {
  _id: number;
  title: string;
  description: string;
}

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title can't exceed 100 characters" }),
  description: z.string().min(1, { message: "Description is required" }).max(500, { message: "Description can't exceed 500 characters" }),
});

type FormData = z.infer<typeof formSchema>;

const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({ title: "", description: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const fetchNotes = useCallback(async () => {
    try {
      const response = await getNotes();
      const notesData = response.data?.data.notes;
      setNotes(Array.isArray(notesData) ? notesData : []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setNotes([]); 
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenPopup = () => setIsPopupOpen(true);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setFormData({ title: "", description: "" });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = formSchema.safeParse(formData);
    if (validation.success) {
      try {
        await createNote(formData.title, formData.description);
        await fetchNotes(); 
        handleClosePopup();
      } catch (error) {
        console.error("An error occurred while creating the note:", error);
      }
    } else {
      const newErrors: Partial<Record<keyof FormData, string>> = {};
      validation.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as keyof FormData] = issue.message;
      });
      setErrors(newErrors);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during sign out:", error);
      alert("Failed to sign out.");
    }
  };

  const handleDeleteNote = async (_id: number) => {
    try {
      await deleteNote(_id);
      setNotes(prevNotes => prevNotes.filter(note => note._id !== _id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
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
          <h2 className="text-xl font-semibold">Welcome!</h2>
          <p className="text-gray-500">{user?.name}</p>
        </div>
        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={handleOpenPopup}
        >
          Create Note
        </button>
        <div>
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note._id}
                className="flex items-center justify-between bg-white p-2 rounded shadow mb-2"
              >
                <div>
                  <span className="font-medium">{note.title}</span>
                  <p className="text-sm text-gray-600">{note.description}</p>
                </div>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteNote(note._id)}
                >
                  🗑️
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white p-4 rounded shadow text-center text-gray-500">
              <p>You haven't created any notes yet. Click the button above to get started!</p>
            </div>
          )}
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