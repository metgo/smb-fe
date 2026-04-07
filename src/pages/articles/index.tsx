import { useState } from 'react';
import {
  Plus, Search, Filter, MoreVertical, Edit2, Copy, Trash2,
  Eye, EyeOff, Calendar, Tag, Globe, FileText, TrendingUp, MousePointer,
  ArrowUpDown, ArrowUp, ArrowDown, Settings2
} from 'lucide-react';
import { GlobalHeader } from './components/GlobalHeader';
import { Sidebar } from './components/Sidebar';
import { useLanguage } from './contexts/LanguageContext';
import { Theme, Language } from './App';
import ArticleWizard from './components/ArticleWizard';
import ArticleDetails from './components/ArticleDetails';

interface ArticlesManagementProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onNavigate: (item: string) => void;
}

export interface Article {
  id: string;
  websiteId: string;
  websiteName: string;
  title: { en: string; he: string; ar: string };
  shortDescription: { en: string; he: string; ar: string };
  fullDescription?: { en: string; he: string; ar: string };
  slug: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  tags: string[];
  primaryMedia: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  shares: number;
}

// Mock data
const mockArticles: Article[] = [
  {
    id: '1',
    websiteId: 'visit-negev',
    websiteName: 'Visit Negev',
    title: {
      en: 'Top 10 Hidden Gems in the Negev Desert',
      he: '10 אוצרות נסתרים במדבר הנגב',
      ar: 'أفضل 10 جواهر مخفية في صحراء النقب'
    },
    shortDescription: {
      en: 'Discover the lesser-known attractions and breathtaking landscapes of the Negev Desert.',
      he: 'גלו את האטרקציות הפחות מוכרות והנופים העוצרי נשימה של מדבר הנגב.',
      ar: 'اكتشف المعالم السياحية الأقل شهرة والمناظر الطبيعية الخلابة في صحراء النقب.'
    },
    slug: 'top-10-hidden-gems-negev-desert',
    status: 'published',
    tags: ['Desert', 'Adventure', 'Nature'],
    primaryMedia: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
    author: 'Sarah Cohen',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T14:30:00Z',
    publishedAt: '2025-01-10T15:00:00Z',
    views: 2847,
    shares: 142
  },
  {
    id: '2',
    websiteId: 'visit-negev',
    websiteName: 'Visit Negev',
    title: {
      en: 'A Culinary Journey Through Western Negev',
      he: 'מסע קולינרי דרך הנגב המערבי',
      ar: 'رحلة طهي عبر النقب الغربي'
    },
    shortDescription: {
      en: 'Experience the rich flavors and unique cuisine of the Western Negev region.',
      he: 'חוו את הטעמים העשירים והמטבח הייחודי של אזור הנגב המערבי.',
      ar: 'استمتع بالنكهات الغنية والمطبخ الفريد لمنطقة النقب الغربي.'
    },
    slug: 'culinary-journey-western-negev',
    status: 'draft',
    tags: ['Food', 'Culture', 'Local'],
    primaryMedia: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    author: 'David Levi',
    createdAt: '2025-01-12T09:00:00Z',
    updatedAt: '2025-01-12T11:45:00Z',
    views: 0,
    shares: 0
  },
  {
    id: '3',
    websiteId: 'visit-beersheba',
    websiteName: 'Visit Beersheba',
    title: {
      en: 'Historical Sites You Must Visit in Beersheba',
      he: 'אתרים היסטוריים שחובה לבקר בהם בבאר שבע',
      ar: 'المواقع التاريخية التي يجب زيارتها في بئر السبع'
    },
    shortDescription: {
      en: 'Explore the ancient history and archaeological wonders of Beersheba.',
      he: 'חקרו את ההיסטוריה העתיקה והפלאים הארכיאולוגיים של באר שבע.',
      ar: 'استكشف التاريخ القديم والعجائب الأثرية في بئر السبع.'
    },
    slug: 'historical-sites-beersheba',
    status: 'published',
    tags: ['History', 'Culture', 'Tourism'],
    primaryMedia: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800',
    author: 'Rachel Mizrahi',
    createdAt: '2025-01-08T08:00:00Z',
    updatedAt: '2025-01-08T16:20:00Z',
    publishedAt: '2025-01-09T09:00:00Z',
    views: 1523,
    shares: 89
  },
  {
    id: '4',
    websiteId: 'visit-sderot',
    websiteName: 'Visit Sderot',
    title: {
      en: 'Family-Friendly Activities in Sderot',
      he: 'פעילויות למשפחות בשדרות',
      ar: 'أنشطة مناسبة للعائلات في سديروت'
    },
    shortDescription: {
      en: 'Find the best activities and attractions for families visiting Sderot.',
      he: 'מצאו את הפעילויות והאטרקציות הטובות ביותר למשפחות המבקרות בשדרות.',
      ar: 'اعثر على أفضل الأنشطة والمعالم السياحية للعائلات التي تزور سديروت.'
    },
    slug: 'family-friendly-activities-sderot',
    status: 'archived',
    tags: ['Family', 'Activities', 'Entertainment'],
    primaryMedia: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
    author: 'Michael Katz',
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2025-01-05T14:00:00Z',
    publishedAt: '2024-12-22T10:00:00Z',
    views: 876,
    shares: 45
  }
];

export default function ArticlesManagement({
  language,
  setLanguage,
  theme,
  setTheme,
  onNavigate
}: ArticlesManagementProps) {
  const { t, isRTL } = useLanguage();
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [showWizard, setShowWizard] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWebsite, setSelectedWebsite] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // View state
  const [currentView, setCurrentView] = useState<'list' | 'details'>('list');
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<'title' | 'views' | 'shares' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Column ordering
  type ColumnKey = 'checkbox' | 'article' | 'website' | 'status' | 'tags' | 'author' | 'stats' | 'updated' | 'actions';
  
  const defaultColumnOrder: ColumnKey[] = [
    'checkbox',
    'article',
    'website',
    'status',
    'tags',
    'author',
    'stats',
    'updated',
    'actions'
  ];

  const [columnOrder, setColumnOrder] = useState<ColumnKey[]>(() => {
    try {
      const saved = localStorage.getItem('articlesTableColumnOrder');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load column order:', e);
    }
    return defaultColumnOrder;
  });

  // Drag and drop state for column reordering
  const [draggedColumn, setDraggedColumn] = useState<ColumnKey | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnKey | null>(null);

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global header states
  const [selectedAuthority, setSelectedAuthority] = useState('all');
  const [selectedWebsiteFilter, setSelectedWebsiteFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last30days');

  const bgPrimary = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const textTertiary = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  // Get unique websites
  const websites = Array.from(new Set(articles.map(a => a.websiteName)));

  // Get all unique tags
  const allTags = Array.from(new Set(articles.flatMap(a => a.tags)));

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title[language as 'en' | 'he' | 'ar'].toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.shortDescription[language as 'en' | 'he' | 'ar'].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWebsite = selectedWebsite === 'all' || article.websiteName === selectedWebsite;
    const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => article.tags.includes(tag));
    
    return matchesSearch && matchesWebsite && matchesStatus && matchesTags;
  });

  const handleCreateArticle = () => {
    setEditingArticle(undefined);
    setShowWizard(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setShowWizard(true);
    setShowMenu(null);
  };

  const handleDuplicateArticle = (article: Article) => {
    const newArticle: Article = {
      ...article,
      id: Date.now().toString(),
      title: {
        en: `${article.title.en} (Copy)`,
        he: `${article.title.he} (העתק)`,
        ar: `${article.title.ar} (نسخة)`
      },
      slug: `${article.slug}-copy`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
      views: 0,
      shares: 0
    };
    setArticles([newArticle, ...articles]);
    setShowMenu(null);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter(a => a.id !== id));
      setSelectedArticles(selectedArticles.filter(sid => sid !== id));
      setShowMenu(null);
    }
  };

  const handleSaveArticle = (articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'shares'>) => {
    if (editingArticle) {
      // Update existing article
      setArticles(articles.map(a => 
        a.id === editingArticle.id 
          ? { 
              ...a, 
              ...articleData, 
              updatedAt: new Date().toISOString(),
              publishedAt: articleData.status === 'published' ? new Date().toISOString() : a.publishedAt
            }
          : a
      ));
    } else {
      // Create new article
      const newArticle: Article = {
        ...articleData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: articleData.status === 'published' ? new Date().toISOString() : undefined,
        views: 0,
        shares: 0
      };
      setArticles([newArticle, ...articles]);
    }
    setShowWizard(false);
    setEditingArticle(undefined);
  };

  const handleBulkAction = (action: 'publish' | 'archive' | 'delete') => {
    if (selectedArticles.length === 0) return;

    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedArticles.length} article(s)?`)) {
        setArticles(articles.filter(a => !selectedArticles.includes(a.id)));
        setSelectedArticles([]);
      }
    } else if (action === 'publish') {
      setArticles(articles.map(a => 
        selectedArticles.includes(a.id) 
          ? { ...a, status: 'published' as const, publishedAt: new Date().toISOString() }
          : a
      ));
      setSelectedArticles([]);
    } else if (action === 'archive') {
      setArticles(articles.map(a => 
        selectedArticles.includes(a.id) 
          ? { ...a, status: 'archived' as const }
          : a
      ));
      setSelectedArticles([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map(a => a.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      case 'scheduled':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'archived':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  // Sort articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (!sortField) return 0;
    
    if (sortField === 'title') {
      const titleA = a.title[language as 'en' | 'he' | 'ar'].toLowerCase();
      const titleB = b.title[language as 'en' | 'he' | 'ar'].toLowerCase();
      if (titleA < titleB) return sortDirection === 'asc' ? -1 : 1;
      if (titleA > titleB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
    
    if (sortField === 'views') {
      return sortDirection === 'asc' ? a.views - b.views : b.views - a.views;
    }
    
    if (sortField === 'shares') {
      return sortDirection === 'asc' ? a.shares - b.shares : b.shares - a.shares;
    }
    
    return 0;
  });

  // Handle sorting
  const handleSort = (field: 'title' | 'views' | 'shares') => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to asc
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: 'title' | 'views' | 'shares') => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      : <ArrowDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  };

  // Drag handlers for column reordering
  const handleDragStart = (column: ColumnKey) => {
    setDraggedColumn(column);
  };

  const handleDragOver = (e: React.DragEvent, column: ColumnKey) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== column) {
      setDragOverColumn(column);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumn: ColumnKey) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetColumn) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedColumn);
      const targetIndex = newOrder.indexOf(targetColumn);
      
      // Remove dragged column and insert at target position
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumn);
      
      setColumnOrder(newOrder);
      // Save to localStorage
      try {
        localStorage.setItem('articlesTableColumnOrder', JSON.stringify(newOrder));
      } catch (e) {
        console.error('Failed to save column order:', e);
      }
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // Helper function to get column label
  const getColumnLabel = (column: ColumnKey): string => {
    const labelMap: Record<ColumnKey, string> = {
      checkbox: '',
      article: 'Article',
      website: 'Website',
      status: 'Status',
      tags: 'Tags',
      author: 'Author',
      stats: 'Stats',
      updated: 'Updated',
      actions: ''
    };
    return labelMap[column] || column;
  };

  // Helper function to render column cell
  const renderColumnCell = (column: ColumnKey, article: Article) => {
    switch (column) {
      case 'checkbox':
        return (
          <td key="checkbox" className="p-4" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selectedArticles.includes(article.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedArticles([...selectedArticles, article.id]);
                } else {
                  setSelectedArticles(selectedArticles.filter(id => id !== article.id));
                }
              }}
              className="rounded"
            />
          </td>
        );

      case 'article':
        return (
          <td key="article" className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={article.primaryMedia}
                alt={article.title[language as 'en' | 'he' | 'ar']}
                className="w-20 h-14 object-cover rounded-lg"
              />
              <div className="min-w-0">
                <p className={`font-semibold ${textPrimary} truncate`}>
                  {article.title[language as 'en' | 'he' | 'ar']}
                </p>
                <p className={`text-sm ${textTertiary} truncate`}>
                  {article.shortDescription[language as 'en' | 'he' | 'ar']}
                </p>
              </div>
            </div>
          </td>
        );

      case 'website':
        return (
          <td key="website" className="p-4">
            <div className="flex items-center gap-2">
              <Globe className={`w-4 h-4 ${textTertiary}`} />
              <span className={`text-sm ${textSecondary}`}>
                {article.websiteName}
              </span>
            </div>
          </td>
        );

      case 'status':
        return (
          <td key="status" className="p-4">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(article.status)}`}>
              {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
            </span>
          </td>
        );

      case 'tags':
        return (
          <td key="tags" className="p-4">
            <div className="flex flex-wrap gap-1">
              {article.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className={`inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 ${textTertiary} text-xs rounded`}
                >
                  {tag}
                </span>
              ))}
              {article.tags.length > 2 && (
                <span className={`inline-block px-2 py-0.5 ${textTertiary} text-xs`}>
                  +{article.tags.length - 2}
                </span>
              )}
            </div>
          </td>
        );

      case 'author':
        return (
          <td key="author" className="p-4">
            <span className={`text-sm ${textSecondary}`}>
              {article.author}
            </span>
          </td>
        );

      case 'stats':
        return (
          <td key="stats" className="p-4">
            <div className={`text-sm ${textSecondary}`}>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {article.views.toLocaleString()} views
              </div>
              <div className="flex items-center gap-1">
                <MousePointer className="w-3 h-3" />
                {article.shares} shares
              </div>
            </div>
          </td>
        );

      case 'updated':
        return (
          <td key="updated" className="p-4">
            <div className="flex items-center gap-1">
              <Calendar className={`w-3 h-3 ${textTertiary}`} />
              <span className={`text-sm ${textTertiary}`}>
                {new Date(article.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </td>
        );

      case 'actions':
        return (
          <td key="actions" className="p-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setShowMenu(showMenu === article.id ? null : article.id)}
                className={`p-2 rounded-lg hover:${bgSecondary} transition-colors ${textTertiary}`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu === article.id && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(null)}
                  />
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-1 w-48 ${bgPrimary} rounded-lg shadow-lg border ${borderColor} py-1 z-20`}>
                    <button
                      onClick={() => handleEditArticle(article)}
                      className={`w-full px-4 py-2 text-${isRTL ? 'right' : 'left'} text-sm ${textSecondary} hover:${bgSecondary} flex items-center gap-2`}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicateArticle(article)}
                      className={`w-full px-4 py-2 text-${isRTL ? 'right' : 'left'} text-sm ${textSecondary} hover:${bgSecondary} flex items-center gap-2`}
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      className={`w-full px-4 py-2 text-${isRTL ? 'right' : 'left'} text-sm text-red-600 hover:${bgSecondary} flex items-center gap-2`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </td>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${bgSecondary} ${isRTL ? 'rtl' : 'ltr'}`}>
      <GlobalHeader
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        onNavigate={onNavigate}
      />

      <div className="flex">
        <Sidebar currentView="articles" onNavigate={onNavigate} theme={theme} />

        <main className="flex-1 ml-0 lg:ml-64">
          {currentView === 'list' ? (
          <div className="p-6 max-w-[1600px] mx-auto">
            {/* Fixed Header Section */}
            <div className="mb-6">
              {/* Page Title and Actions */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className={`text-3xl font-bold ${textPrimary}`}>
                    {t.articles || 'Articles'}
                  </h1>
                  <p className={`text-sm ${textTertiary} mt-1`}>
                    Manage blog articles across all websites
                  </p>
                </div>
                <button
                  onClick={handleCreateArticle}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Article
                </button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className={`text-sm ${textTertiary}`}>Total Articles</p>
                      <p className={`text-2xl font-bold ${textPrimary}`}>{articles.length}</p>
                    </div>
                  </div>
                </div>
                <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className={`text-sm ${textTertiary}`}>Published</p>
                      <p className={`text-2xl font-bold ${textPrimary}`}>
                        {articles.filter(a => a.status === 'published').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className={`text-sm ${textTertiary}`}>Total Views</p>
                      <p className={`text-2xl font-bold ${textPrimary}`}>
                        {articles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <MousePointer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className={`text-sm ${textTertiary}`}>Total Shares</p>
                      <p className={`text-2xl font-bold ${textPrimary}`}>
                        {articles.reduce((sum, a) => sum + a.shares, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4 mb-4`}>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Search */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 ${textTertiary}`} />
                      <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>

                  {/* Website Filter */}
                  <select
                    value={selectedWebsite}
                    onChange={(e) => setSelectedWebsite(e.target.value)}
                    className={`px-4 py-2 ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Websites</option>
                    {websites.map(website => (
                      <option key={website} value={website}>{website}</option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className={`px-4 py-2 ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedArticles.length > 0 && (
                <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4 mb-4`}>
                  <div className="flex items-center justify-between">
                    <span className={textSecondary}>
                      {selectedArticles.length} article(s) selected
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBulkAction('publish')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Publish
                      </button>
                      <button
                        onClick={() => handleBulkAction('archive')}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => handleBulkAction('delete')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Table Section */}
            <div className={`${bgPrimary} rounded-lg border ${borderColor} overflow-hidden max-h-[calc(100vh-500px)] overflow-y-auto`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${bgSecondary} border-b ${borderColor} sticky top-0 z-10`}>
                    <tr>
                      {columnOrder.map(column => {
                        const sortableField = column === 'article' ? 'title' : column === 'stats' ? 'views' : null;
                        const isSortable = sortableField !== null;
                        
                        return (
                          <th
                            key={column}
                            className={`p-3 text-${isRTL ? 'right' : 'left'} text-sm ${textSecondary} ${isSortable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700' : ''} transition-colors select-none`}
                            onClick={isSortable && sortableField ? () => handleSort(sortableField) : undefined}
                            draggable
                            onDragStart={() => handleDragStart(column)}
                            onDragOver={(e) => handleDragOver(e, column)}
                            onDrop={(e) => handleDrop(e, column)}
                            onDragEnd={handleDragEnd}
                            style={{
                              backgroundColor: dragOverColumn === column ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)') : undefined,
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span>{getColumnLabel(column)}</span>
                              {isSortable && sortableField && sortField === sortableField && getSortIcon(sortableField)}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedArticles.length === 0 ? (
                      <tr>
                        <td colSpan={columnOrder.length} className="p-12 text-center">
                          <FileText className={`w-12 h-12 ${textTertiary} mx-auto mb-4`} />
                          <p className={`text-lg ${textSecondary} mb-2`}>No articles found</p>
                          <p className={`text-sm ${textTertiary} mb-4`}>
                            {searchQuery || selectedWebsite !== 'all' || selectedStatus !== 'all'
                              ? 'Try adjusting your filters'
                              : 'Create your first article to get started'}
                          </p>
                          {!searchQuery && selectedWebsite === 'all' && selectedStatus === 'all' && (
                            <button
                              onClick={handleCreateArticle}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Create Article
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      sortedArticles.map((article) => (
                        <tr
                          key={article.id}
                          className={`border-b ${borderColor} hover:${bgSecondary} cursor-pointer transition-colors`}
                          onClick={() => {
                            setViewingArticle(article);
                            setCurrentView('details');
                          }}
                        >
                          {columnOrder.map(column => renderColumnCell(column, article))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          ) : (
            <ArticleDetails
              article={viewingArticle!}
              theme={theme}
              onBack={() => setCurrentView('list')}
              onEdit={() => handleEditArticle(viewingArticle!)}
              onDuplicate={() => handleDuplicateArticle(viewingArticle!)}
            />
          )}
        </main>
      </div>

      {/* Article Creation/Edit Wizard */}
      {showWizard && (
        <ArticleWizard
          theme={theme}
          onClose={() => {
            setShowWizard(false);
            setEditingArticle(undefined);
          }}
          onSave={handleSaveArticle}
          existingArticle={editingArticle}
        />
      )}
    </div>
  );
}