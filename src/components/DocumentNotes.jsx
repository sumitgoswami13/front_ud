import React, { useState, useEffect } from 'react';
import {
  getDocumentNotes,
  addNoteToDocument,
  updateNote,
  deleteNote,
  getDocumentNoteStats
} from '../api/api';

const DocumentNotes = ({ documentId, userId, userType, isVisible, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [noteStats, setNoteStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newNotePriority, setNewNotePriority] = useState('medium');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [editNotePriority, setEditNotePriority] = useState('medium');
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(null);
  const [showInternalNotes, setShowInternalNotes] = useState(false);

  useEffect(() => {
    if (isVisible && documentId) {
      fetchNotes();
      fetchNoteStats();
    }
  }, [isVisible, documentId, userId, userType]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await getDocumentNotes(documentId, userId, userType);
      
      if (response.success && response.data) {
        setNotes(response.data);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNoteStats = async () => {
    if (userType === 'admin') {
      try {
        const response = await getDocumentNoteStats(documentId);
        if (response.success && response.data) {
          setNoteStats(response.data);
        }
      } catch (err) {
        console.error('Error fetching note stats:', err);
      }
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setIsAddingNote(true);
      setError('');

      const noteData = {
        userId,
        userType,
        noteText: newNote.trim(),
        priority: newNotePriority,
        noteType: userType === 'admin' ? 'admin' : 'user',
        isInternal: userType === 'admin' && showInternalNotes
      };

      const response = await addNoteToDocument(documentId, noteData);
      
      if (response.success) {
        setNewNote('');
        setNewNotePriority('medium');
        await fetchNotes();
        await fetchNoteStats();
      } else {
        setError('Failed to add note. Please try again.');
      }
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note. Please try again.');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note._id);
    setEditNoteText(note.noteText);
    setEditNotePriority(note.priority);
  };

  const handleUpdateNote = async () => {
    if (!editNoteText.trim()) return;

    try {
      setIsUpdatingNote(true);
      setError('');

      const noteData = {
        userId,
        userType,
        noteText: editNoteText.trim(),
        priority: editNotePriority
      };

      const response = await updateNote(editingNote, noteData);
      
      if (response.success) {
        setEditingNote(null);
        setEditNoteText('');
        setEditNotePriority('medium');
        await fetchNotes();
      } else {
        setError('Failed to update note. Please try again.');
      }
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note. Please try again.');
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setIsDeletingNote(noteId);
      setError('');

      const response = await deleteNote(noteId, userId, userType);
      
      if (response.success) {
        await fetchNotes();
        await fetchNoteStats();
      } else {
        setError('Failed to delete note. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    } finally {
      setIsDeletingNote(null);
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
        priorityColors[priority] || 'bg-gray-100 text-gray-800 border-gray-200'
      }`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Medium'}
      </span>
    );
  };

  const getNoteTypeBadge = (noteType, isInternal) => {
    if (isInternal) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full border bg-purple-100 text-purple-800 border-purple-200">
          Internal
        </span>
      );
    }
    
    const typeColors = {
      user: 'bg-blue-100 text-blue-800 border-blue-200',
      admin: 'bg-green-100 text-green-800 border-green-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
        typeColors[noteType] || 'bg-gray-100 text-gray-800 border-gray-200'
      }`}>
        {noteType === 'admin' ? 'Admin' : 'User'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEditNote = (note) => {
    // User can edit their own notes, admin can edit any note
    return userType === 'admin' || note.userId === userId;
  };

  const canDeleteNote = (note) => {
    // User can delete their own notes, admin can delete any note
    return userType === 'admin' || note.userId === userId;
  };

  const filteredNotes = notes.filter(note => {
    // Show all notes to admin, only non-internal notes to users
    if (userType === 'admin') return true;
    return !note.isInternal;
  });

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-full max-w-4xl shadow-lg rounded-lg bg-white min-h-[90vh] mb-8">
        
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Document Notes
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Document ID: {documentId.slice(-8)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Note Statistics (Admin only) */}
              {userType === 'admin' && noteStats && (
                <div className="flex space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{noteStats.totalNotes || 0}</div>
                    <div className="text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-yellow-600">{noteStats.urgentNotes || 0}</div>
                    <div className="text-gray-500">Urgent</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-purple-600">{noteStats.internalNotes || 0}</div>
                    <div className="text-gray-500">Internal</div>
                  </div>
                </div>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Add New Note */}
        <div className="p-6 border-b bg-white">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Note</h4>
          <div className="space-y-4">
            <div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={userType === 'admin' ? 
                  "Add a note about this document. Use this to communicate with the user or add internal notes." : 
                  "Add a note or question about this document. This will notify the admin team."
                }
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newNotePriority}
                    onChange={(e) => setNewNotePriority(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                {userType === 'admin' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="internal-note"
                      checked={showInternalNotes}
                      onChange={(e) => setShowInternalNotes(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="internal-note" className="ml-2 text-sm text-gray-700">
                      Internal note (not visible to user)
                    </label>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || isAddingNote}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isAddingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              All Notes ({filteredNotes.length})
            </h4>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-600">Be the first to add a note about this document.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className={`border rounded-lg p-4 ${
                    note.isInternal ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-white'
                  } ${note.priority === 'urgent' ? 'ring-2 ring-red-200' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getNoteTypeBadge(note.noteType, note.isInternal)}
                      {getPriorityBadge(note.priority)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(note.createdAt)}
                      </span>
                      {canEditNote(note) && (
                        <button
                          onClick={() => handleEditNote(note)}
                          className="text-gray-400 hover:text-gray-600 text-xs"
                          title="Edit note"
                        >
                          ✏️
                        </button>
                      )}
                      {canDeleteNote(note) && (
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          disabled={isDeletingNote === note._id}
                          className="text-gray-400 hover:text-red-600 text-xs"
                          title="Delete note"
                        >
                          {isDeletingNote === note._id ? '⏳' : '🗑️'}
                        </button>
                      )}
                    </div>
                  </div>

                  {editingNote === note._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                          <select
                            value={editNotePriority}
                            onChange={(e) => setEditNotePriority(e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingNote(null);
                              setEditNoteText('');
                              setEditNotePriority('medium');
                            }}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateNote}
                            disabled={!editNoteText.trim() || isUpdatingNote}
                            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                          >
                            {isUpdatingNote ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900 whitespace-pre-wrap">{note.noteText}</p>
                      {note.updatedAt !== note.createdAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Updated: {formatDate(note.updatedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentNotes;
