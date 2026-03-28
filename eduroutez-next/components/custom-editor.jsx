import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Autoformat,
  AutoImage,
  Autosave,
  BlockQuote,
  Bold,
  CloudServices,
  Essentials,
  Heading,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  FileRepository,
  ButtonView
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

/**
 * Create a free account with a trial: https://portal.ckeditor.com/checkout?plan=free
 */
const LICENSE_KEY = 'GPL'; // or <YOUR_LICENSE_KEY>.

class MyUploadAdapter {
  constructor(loader, url) {
    this.loader = loader;
    this.url = url;
  }

  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          this._initRequest();
          this._initListeners(resolve, reject, file);
          this._sendRequest(file);
        })
    );
  }

  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  _initRequest() {
    const xhr = (this.xhr = new XMLHttpRequest());
    xhr.open('POST', this.url, true);
    xhr.responseType = 'json';

    // Add authentication headers
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      xhr.setRequestHeader('x-access-token', accessToken);
    }
  }

  _initListeners(resolve, reject, file) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = `Couldn't upload file: ${file.name}.`;

    xhr.addEventListener('error', () => reject(genericErrorText));
    xhr.addEventListener('abort', () => reject());
    xhr.addEventListener('load', () => {
      const response = xhr.response;

      if (!response || response.error) {
        return reject(response && response.error ? response.error.message : genericErrorText);
      }

      resolve({
        default: response.url
      });
    });

    if (xhr.upload) {
      xhr.upload.addEventListener('progress', (evt) => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }

  _sendRequest(file) {
    const data = new FormData();
    data.append('upload', file);
    this.xhr.send(data);
  }
}

function MediaUploadSupport(editor) {
  // Configures the upload adapter
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
    return new MyUploadAdapter(loader, `${apiUrl}/upload-editor`);
  };

  // Registers the videoUpload component
  editor.ui.componentFactory.add('videoUpload', (locale) => {
    const view = new ButtonView(locale);

    view.set({
      label: 'Upload Video',
      icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l5.197-3L10 9v6z"/><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 18V6h16v12H4z"/></svg>',
      tooltip: true
    });

    view.on('execute', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('upload', file);

        const accessToken = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

        try {
          const response = await fetch(`${apiUrl}/upload-editor`, {
            method: 'POST',
            headers: {
              'x-access-token': accessToken || ''
            },
            body: formData
          });

          const data = await response.json();
          console.log('Video upload response:', data);
          console.log('Available editor commands:', Array.from(editor.commands.names()));
          
          if (data.url) {
            try {
              // Try the official mediaEmbed command first
              if (editor.commands.get('mediaEmbed')) {
                editor.execute('mediaEmbed', data.url);
              } else {
                // Fallback: insert as a link which MediaEmbed might pick up
                editor.model.change(writer => {
                  const p = writer.createElement('paragraph');
                  const link = writer.createText(data.url, { linkHref: data.url });
                  writer.append(link, p);
                  editor.model.insertContent(p);
                });
              }
            } catch (embedError) {
              console.error('Media embed execution failed:', embedError);
              // Final fallback: just insert the text as a link
              editor.model.change(writer => {
                const pos = editor.model.document.selection.getFirstPosition() || editor.model.document.getRoot().getChild(0);
                writer.insertText(data.url, { linkHref: data.url }, pos);
              });
            }
          }
        } catch (error) {
          console.error('Video upload failed:', error);
        }
      };

      input.click();
    });

    return view;
  });
}

export default function CustomEditor({ value, onChange }) {
    // Debug: log the value prop on every render
    useEffect(() => {
      console.log('CustomEditor value prop:', value);
    }, [value]);
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const initialValue = useRef(value || '');
  const [editorContent, setEditorContent] = useState(value || '');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const lastContentRef = useRef(value || '');
  const isUserEditingRef = useRef(false);
  
  // Preserve the original value on first render
  useEffect(() => {
    if (isFirstRender) {
      initialValue.current = value || '';
      lastContentRef.current = value || '';
      setIsFirstRender(false);
    }
  }, [value, isFirstRender]);

  // Handle external value changes
  useEffect(() => {
    // Don't update if user is currently typing/editing
    if (isUserEditingRef.current) {
      return;
    }
    
    // Only update if the editor is initialized and value changed
    if (isInitialized && editorRef.current && value !== lastContentRef.current) {
      lastContentRef.current = value || '';
      setEditorContent(value || '');
      
      // Update editor content - carefully check if editor exists and has methods
      if (editorRef.current && typeof editorRef.current.setData === 'function') {
        try {
          editorRef.current.setData(value || '');
        } catch (error) {
          console.error("Error setting editor data:", error);
        }
      }
    }
  }, [value, isInitialized]);

  useEffect(() => {
    setIsLayoutReady(true);
    
    return () => {
      setIsLayoutReady(false);
      isUserEditingRef.current = false;
    };
  }, []);

  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady) {
      return {};
    }

    return {
      editorConfig: {
        toolbar: {
          items: [
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            '|',
            'link',
            'uploadImage',
            'videoUpload',
            'mediaEmbed',
            'insertTable',
            'blockQuote',
            '|',
            'bulletedList',
            'numberedList',
            'todoList',
            'outdent',
            'indent'
          ],
          shouldNotGroupWhenFull: false
        },
        plugins: [
          Autoformat,
          AutoImage,
          Autosave,
          BlockQuote,
          Bold,
          CloudServices,
          Essentials,
          Heading,
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Paragraph,
          PasteFromOffice,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableProperties,
          TableToolbar,
          TextTransformation,
          TodoList,
          Underline,
          FileRepository,
          MediaUploadSupport
        ],
        heading: {
          options: [
            {
              model: 'paragraph',
              title: 'Paragraph',
              class: 'ck-heading_paragraph'
            },
            {
              model: 'heading1',
              view: 'h1',
              title: 'Heading 1',
              class: 'ck-heading_heading1'
            },
            {
              model: 'heading2',
              view: 'h2',
              title: 'Heading 2',
              class: 'ck-heading_heading2'
            },
            {
              model: 'heading3',
              view: 'h3',
              title: 'Heading 3',
              class: 'ck-heading_heading3'
            },
            {
              model: 'heading4',
              view: 'h4',
              title: 'Heading 4',
              class: 'ck-heading_heading4'
            },
            {
              model: 'heading5',
              view: 'h5',
              title: 'Heading 5',
              class: 'ck-heading_heading5'
            },
            {
              model: 'heading6',
              view: 'h6',
              title: 'Heading 6',
              class: 'ck-heading_heading6'
            }
          ]
        },
        image: {
          toolbar: [
            'toggleImageCaption',
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|',
            'resizeImage'
          ]
        },
        // Explicitly use the stored initialValue to prevent re-renders disrupting content
        initialData: initialValue.current,
        licenseKey: LICENSE_KEY,
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: 'https://',
          decorators: {
            toggleDownloadable: {
              mode: 'manual',
              label: 'Downloadable',
              attributes: {
                download: 'file'
              }
            }
          }
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true
          }
        },
        placeholder: 'Type or paste your content here!',
        mediaEmbed: {
          extraProviders: [
            {
              name: 'local',
              url: [
                /^localhost:4001\/api\/uploads\/.+/,
                /^http:\/\/localhost:4001\/api\/uploads\/.+/
              ],
              html: match => {
                const url = match[0].startsWith('http') ? match[0] : `http://${match[0]}`;
                return (
                  '<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
                    `<video controls src="${url}" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;"></video>` +
                  '</div>'
                );
              }
            }
          ]
        },
        table: {
          contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableProperties',
            'tableCellProperties'
          ]
        }
      }
    };
  }, [isLayoutReady]);

  const handleEditorChange = (event, editor) => {
    if (!editor || typeof editor.getData !== 'function') return;
    try {
      isUserEditingRef.current = true;
      const data = editor.getData();
      setEditorContent(data);
      lastContentRef.current = data;
      onChange(data);
      
      // Reset the flag after a short delay to allow batched updates
      setTimeout(() => {
        isUserEditingRef.current = false;
      }, 100);
    } catch (error) {
      console.error("Error handling editor change:", error);
      isUserEditingRef.current = false;
    }
  };

  const handleEditorReady = (editor) => {
    editorRef.current = editor;
    
    // Add focus/blur handlers to track user editing state
    editor.editing.view.document.on('focus', () => {
      isUserEditingRef.current = true;
    });
    
    editor.editing.view.document.on('blur', () => {
      // Small delay to ensure data is processed before setting editing to false
      setTimeout(() => {
        isUserEditingRef.current = false;
      }, 100);
    });
    
    // Set initial content again to be safe
    if (initialValue.current) {
      try {
        editor.setData(initialValue.current);
      } catch (error) {
        console.error("Error setting initial editor data:", error);
      }
    }
    
    setIsInitialized(true);
  };

  return (
    <div className="main-container">
      <div
        className="editor-container editor-container_classic-editor"
        ref={editorContainerRef}
      >
        <div className="editor-container__editor">
          <div ref={editorRef}>
            {editorConfig && (
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                onReady={handleEditorReady}
                data={initialValue.current} // Use the preserved initial value
                onChange={handleEditorChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}