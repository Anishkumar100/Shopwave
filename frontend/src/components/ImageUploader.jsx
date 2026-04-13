import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

/**
 * ImageUploader — multi-file upload to /api/upload
 * props:
 *   value: Array<{public_id, url}>
 *   onChange: (newValue) => void
 *   max: number (default 6)
 */
const ImageUploader = ({ value = [], onChange, max = 6 }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const upload = async (fileList) => {
    const files = Array.from(fileList).slice(0, max - value.length);
    if (files.length === 0) return;
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    setUploading(true);
    try {
      const { data } = await API.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success && data.files?.length) {
        onChange([...value, ...data.files]);
        toast.success(`${data.files.length} image(s) uploaded`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed — check server & auth');
    } finally {
      setUploading(false);
    }
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`relative p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${dragOver ? 'border-brand bg-brand-soft' : 'border-base hover:border-brand hover:bg-card-soft'}`}
      >
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => upload(e.target.files)} disabled={uploading || value.length >= max} />
        <div className="flex flex-col items-center gap-2 text-center">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-brand" />
          )}
          <p className="text-base-c font-bold text-sm">
            {uploading ? 'Uploading…' : value.length >= max ? `Max ${max} images reached` : 'Drop images here or click to browse'}
          </p>
          <p className="text-faint-c text-[11px]">JPG, PNG, WebP · up to 5 MB each · {value.length}/{max}</p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {value.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => remove(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
              {i === 0 && <span className="absolute bottom-1 left-1 badge-green text-[9px]">PRIMARY</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
