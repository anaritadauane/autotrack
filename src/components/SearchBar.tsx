import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterToggle?: () => void;
  placeholder?: string;
  showFilters?: boolean;
}

export function SearchBar({ 
  onSearch, 
  onFilterToggle, 
  placeholder = 'Buscar viaturas, documentos...', 
  showFilters = true 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="relative flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => !query && setIsExpanded(false)}
            placeholder={placeholder}
            className="pl-10 pr-10 h-12 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 transition-all shadow-sm"
          />
          
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Button */}
        {showFilters && onFilterToggle && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onFilterToggle}
              className="w-12 h-12 p-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-lg"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Search Suggestions (when focused) */}
      <AnimatePresence>
        {isExpanded && query && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-10"
          >
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Buscando por: <span className="font-semibold">{query}</span></span>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-gray-500 mb-1">Sugestões:</div>
                {['Seguro', 'Inspeção', 'Impostos', 'Toyota'].filter(s => 
                  s.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Search className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
