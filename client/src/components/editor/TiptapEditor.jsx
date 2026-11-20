import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  ImageIcon,
  Code,
} from 'lucide-react';

export default function TiptapEditor({ content, onChange, placeholder = 'Write comprehensive investigative news report...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-red-400 underline hover:text-red-300',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4 border border-navy-700',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[280px] p-4 text-slate-100 font-serif leading-relaxed',
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border border-navy-700 rounded-xl overflow-hidden bg-navy-950">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-navy-900 border-b border-navy-800">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-navy-800 transition ${
            editor.isActive('bold') ? 'bg-navy-800 text-vanguard-red' : 'text-slate-300'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-navy-800 transition ${
            editor.isActive('italic') ? 'bg-navy-800 text-vanguard-red' : 'text-slate-300'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-navy-750 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-navy-800 transition text-xs font-bold ${
            editor.isActive('heading', { level: 2 }) ? 'bg-navy-800 text-vanguard-red' : 'text-slate-300'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-navy-800 transition text-xs font-bold ${
            editor.isActive('heading', { level: 3 }) ? 'bg-navy-800 text-vanguard-red' : 'text-slate-300'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-navy-750 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-navy-800 transition ${
            editor.isActive('bulletList') ? 'bg-navy-800 text-vanguard-red' : 'text-slate-300'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-navy-800 transition ${
            editor.isActive('orderedList') ? 'bg-navy-800 text-vanguard-red' : 'text-slate-300'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-navy-800 transition ${
            editor.isActive('blockquote') ? 'bg-navy-800 text-vanguard-red' : 'text-slate-300'
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-navy-750 mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded hover:bg-navy-800 transition ${
            editor.isActive('link') ? 'bg-navy-800 text-vanguard-red' : 'text-slate-300'
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-navy-800 transition text-slate-300"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-navy-750 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-navy-800 transition text-slate-400 disabled:opacity-40"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-navy-800 transition text-slate-400 disabled:opacity-40"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Tiptap Input Container */}
      <EditorContent editor={editor} />
    </div>
  );
}
