import { useState, useRef } from 'react';
import {
  X, Check, Trash2, Image as ImageIcon, Video,
  Link as LinkIcon, Heading1, Heading2, Heading3,
  Eye, Upload, Calendar, Tag as TagIcon, User, Clock,
  ExternalLink, Bold, Italic, List, ListOrdered, Plus
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Theme } from '../App';
import { Article } from '../ArticlesManagement';
import { toast } from 'sonner@2.0.3';

interface ArticleWizardProps {
  theme: Theme;
  onClose: () => void;
  onSave: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'shares'>) => void;
  existingArticle?: Article;
}

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  isPrimary: boolean;
}

export default function ArticleWizard({
  theme,
  onClose,
  onSave,
  existingArticle
}: ArticleWizardProps) {
  const { t, isRTL } = useLanguage();
  const [editingLanguage, setEditingLanguage] = useState<'en' | 'he' | 'ar'>('en');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const contentVideoInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    websiteId: existingArticle?.websiteId || 'visit-negev',
    websiteName: existingArticle?.websiteName || 'Visit Negev',
    title: existingArticle?.title || { en: '', he: '', ar: '' },
    shortDescription: existingArticle?.shortDescription || { en: '', he: '', ar: '' },
    fullDescription: existingArticle?.fullDescription || { en: '', he: '', ar: '' },
    slug: existingArticle?.slug || '',
    status: existingArticle?.status || 'draft' as 'draft' | 'published' | 'scheduled' | 'archived',
    tags: existingArticle?.tags || [],
    primaryMedia: existingArticle?.primaryMedia || '',
    author: existingArticle?.author || 'Current User',
    publishedAt: existingArticle?.publishedAt
  });

  // Media files
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(
    existingArticle && existingArticle.primaryMedia
      ? [{
          id: '1',
          url: existingArticle.primaryMedia,
          type: 'image',
          isPrimary: true
        }]
      : []
  );

  // SEO fields
  const [seoData, setSeoData] = useState({
    metaTitle: existingArticle?.title.en || '',
    metaDescription: existingArticle?.shortDescription.en || '',
    ogImage: existingArticle?.primaryMedia || ''
  });

  // Tag input
  const [tagInput, setTagInput] = useState('');

  const bgPrimary = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const textTertiary = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  const websites = ['Visit Negev', 'Visit Beersheba', 'Visit Sderot', 'Visit Ashkelon'];

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: { ...formData.title, [editingLanguage]: value },
      slug: editingLanguage === 'en' ? generateSlug(value) : formData.slug
    });
  };

  // Rich text formatting functions
  const insertFormatting = (before: string, after: string = '') => {
    const editor = contentTextareaRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    // Create text nodes for the formatting
    const beforeNode = document.createTextNode(before);
    const afterNode = document.createTextNode(after);
    
    if (selectedText) {
      // Wrap selected text with formatting
      const textNode = document.createTextNode(selectedText);
      const fragment = document.createDocumentFragment();
      fragment.appendChild(beforeNode);
      fragment.appendChild(textNode);
      fragment.appendChild(afterNode);
      
      range.deleteContents();
      range.insertNode(fragment);
      
      // Move cursor after the formatting
      range.setStartAfter(afterNode);
      range.setEndAfter(afterNode);
    } else {
      // Just insert the formatting markers
      const fragment = document.createDocumentFragment();
      fragment.appendChild(beforeNode);
      fragment.appendChild(afterNode);
      
      range.insertNode(fragment);
      
      // Place cursor between the markers
      range.setStartAfter(beforeNode);
      range.setEndAfter(beforeNode);
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
    editor.focus();

    // Update state
    setFormData({
      ...formData,
      fullDescription: { ...formData.fullDescription, [editingLanguage]: editor.innerHTML }
    });
  };

  const insertText = (text: string) => {
    const editor = contentTextareaRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(text);
      
      range.deleteContents();
      range.insertNode(textNode);
      
      // Move cursor after inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // If no selection, append to end
      editor.appendChild(document.createTextNode(text));
    }
    
    editor.focus();

    // Update state
    setFormData({
      ...formData,
      fullDescription: { ...formData.fullDescription, [editingLanguage]: editor.innerHTML }
    });
  };

  const handleImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        
        // Insert actual image element
        const editor = contentTextareaRef.current;
        if (!editor) return;
        
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '10px 0';
        img.style.borderRadius = '8px';
        img.setAttribute('data-image', 'true');
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);
          
          // Move cursor after image
          range.setStartAfter(img);
          range.setEndAfter(img);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          editor.appendChild(img);
        }
        
        // Update state
        setFormData({
          ...formData,
          fullDescription: { ...formData.fullDescription, [editingLanguage]: editor.innerHTML }
        });
        
        toast.success('Image inserted into content');
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleVideoInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      // Use object URL for videos to avoid memory issues with large files
      const url = URL.createObjectURL(file);
      
      // Insert actual video element
      const editor = contentTextareaRef.current;
      if (!editor) return;
      
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.style.maxWidth = '100%';
      video.style.height = 'auto';
      video.style.display = 'block';
      video.style.margin = '10px 0';
      video.style.borderRadius = '8px';
      video.setAttribute('data-video', 'true');
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(video);
        
        // Move cursor after video
        range.setStartAfter(video);
        range.setEndAfter(video);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editor.appendChild(video);
      }
      
      // Update state
      setFormData({
        ...formData,
        fullDescription: { ...formData.fullDescription, [editingLanguage]: editor.innerHTML }
      });
      
      toast.success('Video inserted into content');
    }
    e.target.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newMedia: MediaFile = {
          id: Date.now().toString(),
          url,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          isPrimary: mediaFiles.length === 0
        };
        setMediaFiles([...mediaFiles, newMedia]);
        
        if (mediaFiles.length === 0) {
          setFormData({ ...formData, primaryMedia: url });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const setPrimaryMedia = (id: string) => {
    const media = mediaFiles.find(m => m.id === id);
    if (media) {
      setMediaFiles(mediaFiles.map(m => ({ ...m, isPrimary: m.id === id })));
      setFormData({ ...formData, primaryMedia: media.url });
    }
  };

  const deleteMedia = (id: string) => {
    const newMediaFiles = mediaFiles.filter(m => m.id !== id);
    setMediaFiles(newMediaFiles);
    
    // If deleted media was primary, set first remaining as primary
    if (mediaFiles.find(m => m.id === id)?.isPrimary && newMediaFiles.length > 0) {
      newMediaFiles[0].isPrimary = true;
      setFormData({ ...formData, primaryMedia: newMediaFiles[0].url });
    } else if (newMediaFiles.length === 0) {
      setFormData({ ...formData, primaryMedia: '' });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleSave = () => {
    // Validate required fields - check if at least one language has content
    const hasTitle = formData.title.en.trim() || formData.title.he.trim() || formData.title.ar.trim();
    const hasDescription = formData.shortDescription.en.trim() || formData.shortDescription.he.trim() || formData.shortDescription.ar.trim();
    
    if (!hasTitle) {
      toast.error('Please enter a title in at least one language');
      return;
    }
    if (!hasDescription) {
      toast.error('Please enter a short description in at least one language');
      return;
    }
    if (!formData.primaryMedia) {
      toast.error('Please upload at least one image and set it as primary');
      return;
    }

    onSave({
      websiteId: formData.websiteId,
      websiteName: formData.websiteName,
      title: formData.title,
      shortDescription: formData.shortDescription,
      fullDescription: formData.fullDescription,
      slug: formData.slug,
      status: formData.status,
      tags: formData.tags,
      primaryMedia: formData.primaryMedia,
      author: formData.author,
      publishedAt: formData.publishedAt
    });
  };

  const handlePublish = () => {
    // Create the updated data with published status
    const updatedData = { 
      ...formData, 
      status: 'published' as const, 
      publishedAt: new Date().toISOString() 
    };
    
    // Validate and save with updated data
    const hasTitle = updatedData.title.en.trim() || updatedData.title.he.trim() || updatedData.title.ar.trim();
    const hasDescription = updatedData.shortDescription.en.trim() || updatedData.shortDescription.he.trim() || updatedData.shortDescription.ar.trim();
    
    if (!hasTitle) {
      toast.error('Please enter a title in at least one language');
      return;
    }
    if (!hasDescription) {
      toast.error('Please enter a short description in at least one language');
      return;
    }
    if (!updatedData.primaryMedia) {
      toast.error('Please upload at least one image and set it as primary');
      return;
    }

    // Update local state
    setFormData(updatedData);
    
    // Save with the updated data
    onSave({
      websiteId: updatedData.websiteId,
      websiteName: updatedData.websiteName,
      title: updatedData.title,
      shortDescription: updatedData.shortDescription,
      fullDescription: updatedData.fullDescription,
      slug: updatedData.slug,
      status: updatedData.status,
      tags: updatedData.tags,
      primaryMedia: updatedData.primaryMedia,
      author: updatedData.author,
      publishedAt: updatedData.publishedAt
    });
    
    toast.success('Article published successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`${bgPrimary} rounded-lg shadow-xl w-full max-w-[1800px] h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
          <div className="flex items-center gap-4">
            <h2 className={`text-2xl font-bold ${textPrimary}`}>
              {existingArticle ? 'Edit Article' : 'Create Article'}
            </h2>
            
            {/* Website Selector */}
            <select
              value={formData.websiteName}
              onChange={(e) => setFormData({
                ...formData,
                websiteName: e.target.value,
                websiteId: e.target.value.toLowerCase().replace(/\s+/g, '-')
              })}
              className={`px-4 py-2 ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {websites.map(website => (
                <option key={website} value={website}>{website}</option>
              ))}
            </select>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingLanguage('en')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  editingLanguage === 'en'
                    ? 'bg-blue-600 text-white'
                    : `${bgSecondary} ${textSecondary} hover:${bgSecondary}`
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setEditingLanguage('he')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  editingLanguage === 'he'
                    ? 'bg-blue-600 text-white'
                    : `${bgSecondary} ${textSecondary} hover:${bgSecondary}`
                }`}
              >
                HE
              </button>
              <button
                onClick={() => setEditingLanguage('ar')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  editingLanguage === 'ar'
                    ? 'bg-blue-600 text-white'
                    : `${bgSecondary} ${textSecondary} hover:${bgSecondary}`
                }`}
              >
                AR
              </button>
            </div>

            {/* Status Indicator */}
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
              formData.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
              formData.status === 'draft' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
              formData.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
              'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
            }`}>
              {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
            </span>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:${bgSecondary} transition-colors ${textTertiary}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Editor Area */}
          <div className={`flex-1 overflow-y-auto p-6 ${showPreview ? 'hidden lg:block' : ''}`}>
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title[editingLanguage]}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title..."
                  className={`w-full text-3xl font-bold ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  dir={editingLanguage === 'he' || editingLanguage === 'ar' ? 'rtl' : 'ltr'}
                />
                <p className={`text-xs ${textTertiary} mt-1`}>
                  {formData.title[editingLanguage].length} characters
                </p>
              </div>

              {/* Short Description */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Short Description *
                </label>
                <textarea
                  value={formData.shortDescription[editingLanguage]}
                  onChange={(e) => setFormData({
                    ...formData,
                    shortDescription: { ...formData.shortDescription, [editingLanguage]: e.target.value }
                  })}
                  placeholder="Enter a brief description for previews and listings..."
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  rows={3}
                  dir={editingLanguage === 'he' || editingLanguage === 'ar' ? 'rtl' : 'ltr'}
                />
                <p className={`text-xs ${textTertiary} mt-1`}>
                  {formData.shortDescription[editingLanguage].length} characters
                </p>
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Full Description *
                </label>
                
                {/* Formatting Toolbar */}
                <div className={`flex flex-wrap items-center gap-1 p-2 ${bgSecondary} border ${borderColor} rounded-t-lg`}>
                  <button
                    onClick={() => insertFormatting('**', '**')}
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary} transition-colors`}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting('*', '*')}
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary} transition-colors`}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <div className={`w-px h-6 ${borderColor} bg-gray-300 dark:bg-gray-600 mx-1`} />
                  <button
                    onClick={() => insertFormatting('# ', '')}
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary} transition-colors`}
                    title="Heading 1"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting('## ', '')}
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary} transition-colors`}
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting('### ', '')}
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary} transition-colors`}
                    title="Heading 3"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>
                  <div className={`w-px h-6 ${borderColor} bg-gray-300 dark:bg-gray-600 mx-1`} />
                  <button
                    onClick={() => insertFormatting('- ', '')}
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary} transition-colors`}
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting('1. ', '')}
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary} transition-colors`}
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <div className={`w-px h-6 ${borderColor} bg-gray-300 dark:bg-gray-600 mx-1`} />
                  <button
                    onClick={() => contentImageInputRef.current?.click()}
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary} transition-colors`}
                    title="Insert Image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => contentVideoInputRef.current?.click()}
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary} transition-colors`}
                    title="Insert Video"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting('[', '](url)')}
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary} transition-colors`}
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Rich Text Editor Area */}
                <div
                  ref={contentTextareaRef as any}
                  contentEditable
                  onInput={(e) => {
                    const content = e.currentTarget.innerHTML;
                    setFormData({
                      ...formData,
                      fullDescription: { ...formData.fullDescription, [editingLanguage]: content }
                    });
                  }}
                  onPaste={(e) => {
                    const items = e.clipboardData?.items;
                    if (!items) return;

                    for (let i = 0; i < items.length; i++) {
                      const item = items[i];
                      
                      // Check if it's an image
                      if (item.type.startsWith('image/')) {
                        e.preventDefault();
                        const file = item.getAsFile();
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const url = event.target?.result as string;
                            
                            // Insert actual image element
                            const img = document.createElement('img');
                            img.src = url;
                            img.style.maxWidth = '100%';
                            img.style.height = 'auto';
                            img.style.display = 'block';
                            img.style.margin = '10px 0';
                            img.style.borderRadius = '8px';
                            img.setAttribute('data-image', 'true');
                            
                            const selection = window.getSelection();
                            if (selection && selection.rangeCount > 0) {
                              const range = selection.getRangeAt(0);
                              range.deleteContents();
                              range.insertNode(img);
                              
                              // Move cursor after image
                              range.setStartAfter(img);
                              range.setEndAfter(img);
                              selection.removeAllRanges();
                              selection.addRange(range);
                            } else {
                              contentTextareaRef.current?.appendChild(img);
                            }
                            
                            toast.success('Image pasted into content');
                          };
                          reader.readAsDataURL(file);
                        }
                        return;
                      }
                      
                      // Check if it's a video
                      if (item.type.startsWith('video/')) {
                        e.preventDefault();
                        const file = item.getAsFile();
                        if (file) {
                          // Use object URL for videos to avoid memory issues with large files
                          const url = URL.createObjectURL(file);
                          
                          // Insert actual video element
                          const video = document.createElement('video');
                          video.src = url;
                          video.controls = true;
                          video.style.maxWidth = '100%';
                          video.style.height = 'auto';
                          video.style.display = 'block';
                          video.style.margin = '10px 0';
                          video.style.borderRadius = '8px';
                          video.setAttribute('data-video', 'true');
                          
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            range.deleteContents();
                            range.insertNode(video);
                            
                            // Move cursor after video
                            range.setStartAfter(video);
                            range.setEndAfter(video);
                            selection.removeAllRanges();
                            selection.addRange(range);
                          } else {
                            contentTextareaRef.current?.appendChild(video);
                          }
                          
                          toast.success('Video pasted into content');
                        }
                        return;
                      }
                    }
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: formData.fullDescription[editingLanguage] || '' 
                  }}
                  className={`w-full min-h-[400px] ${bgSecondary} ${textPrimary} border-x border-b ${borderColor} rounded-b-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto prose prose-sm max-w-none`}
                  style={{
                    direction: editingLanguage === 'he' || editingLanguage === 'ar' ? 'rtl' : 'ltr'
                  }}
                  data-placeholder="Write your article content here... Use the toolbar above to format text, insert images, videos, and links. You can also paste images and videos directly from your clipboard!"
                />
                <p className={`text-xs ${textTertiary} mt-1`}>
                  {(formData.fullDescription[editingLanguage]?.length || 0)} characters • Rich text with inline media • Paste images/videos directly
                </p>

                {/* Hidden file inputs */}
                <input
                  ref={contentImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageInsert}
                  className="hidden"
                />
                <input
                  ref={contentVideoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoInsert}
                  className="hidden"
                />
              </div>

              {/* Media Management */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Featured Media (Up to 5 files) *
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {mediaFiles.map(media => (
                    <div
                      key={media.id}
                      className={`relative group ${bgSecondary} rounded-lg border-2 ${
                        media.isPrimary ? 'border-blue-500' : borderColor
                      } overflow-hidden`}
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt="Media"
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center">
                          <Video className={`w-8 h-8 ${textTertiary}`} />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!media.isPrimary && (
                          <button
                            onClick={() => setPrimaryMedia(media.id)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => deleteMedia(media.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {media.isPrimary && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {mediaFiles.length < 5 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-32 ${bgSecondary} border-2 border-dashed ${borderColor} rounded-lg flex flex-col items-center justify-center gap-2 hover:${bgSecondary} transition-colors ${textTertiary}`}
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">Upload</span>
                    </button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Preview / Settings Sidebar */}
          <div className={`w-full lg:w-96 border-l ${borderColor} ${bgSecondary} overflow-y-auto p-6 ${showPreview ? '' : 'hidden lg:block'}`}>
            <div className="space-y-6">
              {/* Preview Toggle */}
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>Settings</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`p-2 rounded-lg hover:${bgSecondary} transition-colors ${textTertiary} lg:hidden`}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              {/* Publishing */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>Publishing</h4>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className={`w-full px-4 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>Tags</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag..."
                    className={`flex-1 px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-3 py-1 ${bgPrimary} ${textSecondary} border ${borderColor} rounded-full text-sm`}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SEO & Metadata */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>SEO & Metadata</h4>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>Meta Title</label>
                    <input
                      type="text"
                      value={seoData.metaTitle}
                      onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
                      placeholder="Auto-generated from title"
                      className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>Meta Description</label>
                    <textarea
                      value={seoData.metaDescription}
                      onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
                      placeholder="Auto-generated from short description"
                      className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none`}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Attribution */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>Attribution</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className={`w-4 h-4 ${textTertiary}`} />
                    <span className={`text-sm ${textSecondary}`}>
                      {formData.author}
                    </span>
                  </div>
                  {existingArticle && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${textTertiary}`} />
                        <span className={`text-sm ${textTertiary}`}>
                          Created {new Date(existingArticle.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${textTertiary}`} />
                        <span className={`text-sm ${textTertiary}`}>
                          Updated {new Date(existingArticle.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`flex items-center justify-between p-6 border-t ${borderColor}`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(`/preview/${formData.slug}`, '_blank')}
              className={`flex items-center gap-2 px-4 py-2 ${bgSecondary} ${textSecondary} rounded-lg hover:${bgSecondary} transition-colors`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => window.open(`https://${formData.websiteId}.com/articles/${formData.slug}`, '_blank')}
              className={`flex items-center gap-2 px-4 py-2 ${bgSecondary} ${textSecondary} rounded-lg hover:${bgSecondary} transition-colors`}
            >
              <ExternalLink className="w-4 h-4" />
              Website Preview
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFormData({ ...formData, status: 'draft' });
                setTimeout(() => handleSave(), 0);
              }}
              className={`px-6 py-2 ${bgSecondary} ${textSecondary} rounded-lg hover:${bgSecondary} transition-colors`}
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              {formData.status === 'published' ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}