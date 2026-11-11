import { useRef, useState } from "react";
import { useEditor, EditorContent, Node, mergeAttributes, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { upload, problem } from "./db";

/* Video isn't built in: a block that holds one uploaded clip. */
const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes({ controls: "", playsinline: "", preload: "metadata" }, HTMLAttributes)];
  },
});

function Tool({
  label,
  title,
  active,
  disabled,
  onClick,
  className,
}: {
  label: string;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      title={title}
      aria-label={title}
      aria-pressed={active === undefined ? undefined : active}
      disabled={disabled}
      // Keep the text selection while the button is pressed.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/* The editor writes HTML and shows it in the same styles as the live page. */
export function RichText({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder: string;
}) {
  const [note, setNote] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const current = useRef<Editor | null>(null);

  async function addFiles(files: File[]) {
    const editor = current.current;
    if (!editor) return;
    for (const item of files) {
      const video = item.type.startsWith("video/");
      if (!video && !item.type.startsWith("image/")) {
        setNote("Only images and video can be added here.");
        continue;
      }
      setNote(`Uploading ${item.name}`);
      try {
        const src = await upload(item);
        if (video) editor.chain().focus().insertContent({ type: "video", attrs: { src } }).run();
        else editor.chain().focus().setImage({ src, alt: "" }).run();
        setNote(video ? "" : "Image added. Select it to describe it for people who can’t see it.");
      } catch (error) {
        setNote(`${item.name} didn’t upload. ${problem(error)}`);
      }
    }
  }
  const media = (list?: FileList | null) =>
    [...(list || [])].filter((f) => /^(image|video)\//.test(f.type));

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Image,
      Video,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: {
      attributes: { class: "prose editor-body", "aria-label": "Content" },
      handlePaste(_view, event) {
        const files = media(event.clipboardData?.files);
        if (!files.length) return false;
        addFiles(files);
        return true;
      },
      handleDrop(_view, event) {
        const files = media(event.dataTransfer?.files);
        if (!files.length) return false;
        event.preventDefault();
        addFiles(files);
        return true;
      },
    },
  });
  current.current = editor;
  if (!editor) return <div className="editor" aria-busy="true" />;

  const chain = () => editor.chain().focus();
  function applyLink() {
    const address = (link || "").trim();
    if (!address) chain().extendMarkRange("link").unsetLink().run();
    else
      chain()
        .extendMarkRange("link")
        .setLink({ href: /^(https?:|mailto:|\/)/.test(address) ? address : `https://${address}` })
        .run();
    setLink(null);
  }
  const onImage = editor.isActive("image");

  return (
    <div className="editor">
      <div className="toolbar" role="toolbar" aria-label="Formatting">
        <Tool label="Text" active={editor.isActive("paragraph")} onClick={() => chain().setParagraph().run()} />
        <Tool label="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
        <Tool label="Subheading" active={editor.isActive("heading", { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
        <i />
        <Tool label="B" title="Bold" className="tool-bold" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()} />
        <Tool label="I" title="Italic" className="tool-italic" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()} />
        <Tool
          label="Link"
          active={editor.isActive("link")}
          onClick={() => setLink(link === null ? editor.getAttributes("link").href || "" : null)}
        />
        <i />
        <Tool label="List" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()} />
        <Tool label="Numbered" active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()} />
        <Tool label="Quote" active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()} />
        <Tool label="Code" active={editor.isActive("codeBlock")} onClick={() => chain().toggleCodeBlock().run()} />
        <Tool label="Divider" onClick={() => chain().setHorizontalRule().run()} />
        <i />
        <Tool label="Image or video" onClick={() => file.current?.click()} />
        <span className="toolbar-end">
          <Tool label="Undo" disabled={!editor.can().undo()} onClick={() => chain().undo().run()} />
          <Tool label="Redo" disabled={!editor.can().redo()} onClick={() => chain().redo().run()} />
        </span>
        <input
          ref={file}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          aria-label="Upload images or video"
          onChange={(e) => {
            addFiles([...(e.target.files || [])]);
            e.target.value = "";
          }}
        />
      </div>
      {link !== null ? (
        <form
          className="toolbar-row"
          onSubmit={(e) => {
            e.preventDefault();
            applyLink();
          }}
        >
          <input
            autoFocus
            value={link}
            placeholder="Paste or type a link. Leave empty to remove it."
            aria-label="Link address"
            onChange={(e) => setLink(e.target.value)}
          />
          <button type="submit" className="text-button">
            Apply
          </button>
        </form>
      ) : null}
      {onImage ? (
        <div className="toolbar-row">
          <input
            value={editor.getAttributes("image").alt || ""}
            placeholder="Describe this image for people who can’t see it"
            aria-label="Image description"
            onChange={(e) => editor.commands.updateAttributes("image", { alt: e.target.value })}
          />
        </div>
      ) : null}
      <EditorContent editor={editor} />
      {note ? (
        <p className="editor-note" role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}
