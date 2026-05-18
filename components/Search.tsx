'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const query = searchParams.get('query') || '';

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams);
        
        if (value) {
            params.set('query', value);
        } else {
            params.delete('query');
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="library-search-wrapper animate-in fade-in duration-300">
            <SearchIcon className="absolute left-3.5 w-4.5 h-4.5 text-[#a0aec0] pointer-events-none" />
            <input 
                type="text" 
                placeholder="Search by title or author..." 
                className="library-search-input" 
                value={query}
                onChange={handleSearch}
            />
        </div>
    );
};

export default Search;
