import { useState, useRef } from "react";
import { Send, Image as ImageIcon, X, Loader2 } from "lucide-react";

const MessageInput = ({ onSendMessage, onTyping, onStopTyping }) => {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
    onTyping();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
    }, 2000);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedImage) return;

    setSending(true);
    const success = await onSendMessage(text, selectedImage);
    setSending(false);

    if (success) {
      setText("");
      clearImage();
      onStopTyping();
    }
  };

  return (
    <div className="p-3 bg-slate-900/60 border-t border-white/10">
      {/* Image Preview Pill */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-indigo-500/40 relative">
            <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />
          </div>
          <button
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Attachment Button */}
        <label
          htmlFor="file-upload"
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          title="Attach Image"
        >
          <ImageIcon size={18} />
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Input Text Box */}
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={sending || (!text.trim() && !selectedImage)}
          className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
