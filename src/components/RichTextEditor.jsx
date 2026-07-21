import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { RICH_TEXT_CLASSES, RICH_TEXT_PLACEHOLDER_CLASSES } from '../utils/richText';

function ToolbarButton({ onClick, active, children, title }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`px-2 py-1 rounded text-[11px] font-bold uppercase transition ${
        active ? 'bg-orange-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

// ✍️ Editor enriquecido (negrita, subtítulos, listas) para textos largos como la descripción de la propiedad.
// Guarda y devuelve HTML plano; los textos viejos en texto plano se siguen mostrando igual.
export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder })],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-[160px] max-h-[400px] overflow-y-auto bg-slate-950 border border-slate-800 rounded-b-lg p-3 text-white text-xs focus:outline-none',
      },
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  return (
    <div className={`w-full ${RICH_TEXT_CLASSES} ${RICH_TEXT_PLACEHOLDER_CLASSES}`}>
      <div className="flex flex-wrap gap-1 bg-slate-900 border border-slate-800 border-b-0 rounded-t-lg p-1.5">
        <ToolbarButton title="Negrita" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
        <ToolbarButton title="Cursiva" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarButton>
        <ToolbarButton title="Subtítulo grande" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton title="Subtítulo chico" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <ToolbarButton title="Lista" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Lista</ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
