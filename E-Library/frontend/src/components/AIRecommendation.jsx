import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRankerUrl } from '../config/ApiConfig';

const AIRecommendation = ({ book }) => {
  const RANKER_BASE = getRankerUrl();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no book, skip
    if (!book) {
      console.log('[AIRec] No book provided');
      return;
    }
    
    // Extract available fields
    const title = book.title || book.name || '';
    const description = book.description || '';
    const bookId = book.bookId || book.id || 0;
    
    console.log('[AIRec] Book:', { title, description, bookId });
    
    // If no title AND no description, skip
    if (!title && !description) {
      console.log('[AIRec] No title/description, skipping fetch');
      return;
    }

    let mounted = true;

    const fetch_recommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('[AIRec] Fetching from:', RANKER_BASE);
        const response = await fetch(`${RANKER_BASE}/recommend/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, id: bookId })
        });
        
        console.log('[AIRec] Response:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (!mounted) return;
        
        console.log('[AIRec] Got recommendations:', data);
        setRecommendations(data.recommendations || []);
        setError(null);
      } catch (err) {
        console.error('[AIRec] Error:', err);
        if (!mounted) return;
        
        setError(err.message || 'Failed to connect');
        setRecommendations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Call immediately
    fetch_recommendations();

    return () => { mounted = false; };
  }, [book, RANKER_BASE]);

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded mt-3 text-sm">⚠️ {error}</div>;
  }

  if (loading) {
    return <div className="p-4 bg-gray-50 rounded mt-3 animate-pulse">Loading recommendations...</div>;
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="flex items-center gap-2 font-bold mb-4">
        <Sparkles size={18} className="text-indigo-500" />
        AI Recommends
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map(rec => (
          <div 
            key={rec.id}
            onClick={() => navigate(`/books/${rec.id}`)}
            className="p-3 border rounded cursor-pointer hover:bg-indigo-50 transition"
          >
            {rec.cover_url && (
              <img src={rec.cover_url} alt={rec.title} className="w-full aspect-[2/3] object-cover rounded mb-2 shadow-sm" />
            )}
            <p className="font-bold text-sm line-clamp-2">{rec.title}</p>
            <p className="text-xs text-gray-500">{rec.author}</p>
            <p className="text-xs text-indigo-600 mt-2">🎯 {rec.match_score}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendation;