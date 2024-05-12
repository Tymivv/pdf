import React, { useState, useRef } from 'react';
import { PDFDocument} from 'pdf-lib';

import style from './App.module.css';



export const App =() =>{
  const [files, setFiles] = useState([]);
  const [mergedPDF, setMergedPDF] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
console.log(files);
  const handleFileChange = (event) => {
    if(event.target.files.length<2){
      return
    }
    setMergedPDF(null);
    const newFiles = [...event.target.files];
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };
    

  const openFileInput = () => {
    fileInputRef.current.click();
  };
  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const moveFile = (fromIndex, toIndex) => {
    const updatedFiles = [...files];
    const movedFile = updatedFiles.splice(fromIndex, 1)[0];
    updatedFiles.splice(toIndex, 0, movedFile);
    setFiles(updatedFiles);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      setError('Виберіть принаймні два файли PDF.');
      return;
    }

    try {
      const mergedDoc = await PDFDocument.create();

      for (const file of files) {
        const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
        const copiedPages = await mergedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedDoc.addPage(page));
      }
      const mergedPDFBytes = await mergedDoc.save();

      setMergedPDF(new Blob([mergedPDFBytes], { type: 'application/pdf' }));
      setError(null);
      setFiles([]);
    } catch (error) {
      setError('Помилка зшивання документів', error);
    }
  };
  let d = new Date().getTime()
  return (
    <div className={style.container}>
    <div className={style.card}>
      <h1>Об'эднання PDF файлів</h1>
      <input
        type="file"
        onChange={handleFileChange}
        multiple
        accept='.pdf'
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <button className={style.btn}onClick={openFileInput}>Виберіть PDF файли</button>
      {files.length>1 && <button className={style.btn} onClick={mergePDFs}>Об'єднати PDF файли</button>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {mergedPDF && (
        <div className={style.download}>
        <a className={style.downloadLink } href={URL.createObjectURL(mergedPDF)} download={`${d}`}>
          Завантажити PDF
        </a>
        </div>
      )}
      <div className={style.preview}>
      <ul>
        {files.map((file, index) => (
          <li className={style.list}key={index}>
            {file.name}{' '}
            <div className={style.previewRemove} onClick={() => removeFile(index)}>&#10006;</div>
            {index > 0 && (
              <div className={style.arrow} onClick={() => moveFile(index, index - 1)}>&#11014;</div>
            )}
            {index < files.length - 1 && (
              <div className={style.arrow} onClick={() => moveFile(index, index + 1)}>&#11015;</div>
            )}
          </li>
        ))}
      </ul>
      </div>
    </div>
    </div>
  );
};