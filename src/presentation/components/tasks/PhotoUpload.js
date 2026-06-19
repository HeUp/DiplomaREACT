import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  ImageList,
  ImageListItem,
  IconButton,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CloudUpload, Delete, AddAPhoto } from '@mui/icons-material';

const compressImage = (file, maxWidth = 1920, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(
              new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
            );
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
};

const PhotoUpload = ({ onUpload, maxFiles = 5 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (accepted) => {
      const compressed = await Promise.all(
        accepted.map((f) => compressImage(f))
      );
      setFiles((prev) => [...prev, ...compressed].slice(0, maxFiles));
    },
    [maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles,
  });

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append('photos', f));
    await onUpload(formData);
    setFiles([]);
    setUploading(false);
  };

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          mb: 2,
        }}
      >
        <input {...getInputProps()} />
        <AddAPhoto sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
        <Typography color="text.secondary">
          {isDragActive
            ? 'Перетащите файлы сюда'
            : 'Нажмите или перетащите фотографии для загрузки'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          JPEG, PNG. До {maxFiles} файлов. Автосжатие.
        </Typography>
      </Box>

      {files.length > 0 && (
        <>
          <ImageList cols={isMobile ? 2 : 3} rowHeight={isMobile ? 100 : 120}>
            {files.map((file, idx) => (
              <ImageListItem key={idx}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  loading="lazy"
                  style={{ height: 120, objectFit: 'cover', borderRadius: 4 }}
                />
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.8)' }}
                  onClick={() => removeFile(idx)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </ImageListItem>
            ))}
          </ImageList>

          <Button
            variant="contained"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            onClick={handleUpload}
            disabled={uploading}
            fullWidth
          >
            {uploading ? 'Загрузка...' : 'Загрузить фотографии'}
          </Button>
        </>
      )}
    </Box>
  );
};

export default PhotoUpload;
