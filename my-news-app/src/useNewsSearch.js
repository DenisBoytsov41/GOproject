import { useState, useEffect } from 'react';

const cacheExpirationTime = 60 * 60 * 1000;

const useNewsSearch = () => {
  const [searchKey, setSearchKey] = useState(localStorage.getItem('searchKey') || '');
  const [results, setResults] = useState('');
  const [currentPage, setCurrentPage] = useState(parseInt(localStorage.getItem('currentPage'), 10) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [visiblePagesCount] = useState(10);
  const [visiblePages, setVisiblePages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePagesCount / 2));
    const endPage = Math.min(totalPages, startPage + visiblePagesCount - 1);

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => index + startPage);
    setVisiblePages(pages);
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage, totalPages, visiblePagesCount]);

  useEffect(() => {
    localStorage.setItem('searchKey', searchKey);
  }, [searchKey]);

  useEffect(() => {
    if (results) {
      console.log(results);
      try {
        console.log("Я тут");
        setTotalPages(Math.ceil(results.Results.totalResults / 20));
      }
      catch (error) {
        console.log("Я тут");
        setTotalPages(Math.ceil(results.totalResults / 20));
      } 
      console.log(currentPage);
      console.log(totalPages);
      console.log(!loading);
      setLoading(false);

    }
  }, [results]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cachedResults = JSON.parse(localStorage.getItem(`${searchKey}-page-1`));
      try
      {
        if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.totalResults != null) {
          setResults(cachedResults);
          setCurrentPage(1);
          setLoading(false);
          return;
        }
      }
      catch(e)
      {
        if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.data.Results.totalResults != null) {
          setResults(cachedResults);
          setCurrentPage(1);
          setLoading(false);
          return;
        }
      }
      
  
      fetch(`http://localhost:5000/search?q=${searchKey}&page=1`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Ошибка при получении данных');
          }
          return response.json();
        })
        .then(data => {
          try
          {
            setResults(data);
            setCurrentPage(1);
            console.log(data.Results.totalResults);
            setTotalPages(Math.ceil(data.Results.totalResults / 20));
            localStorage.setItem(`${searchKey}-page-${currentPage}`, JSON.stringify({ data, timestamp: Date.now() }));
          }
          catch(e)
          {
            setResults(data);
            setCurrentPage(1);
            console.log(data.totalResults);
            setTotalPages(Math.ceil(data.totalResults / 20));
            localStorage.setItem(`${searchKey}-page-${currentPage}`, JSON.stringify({ data, timestamp: Date.now() }));
          }
          
        })
        .catch(error => console.error('Ошибка:', error))
        .finally(() => setLoading(false));
    } 
    catch (error) {
      console.error('Ошибка:', error);
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setLoading(true);
      try {
        const nextPage = currentPage + 1;
        const cachedResults = JSON.parse(localStorage.getItem(`${searchKey}-page-${nextPage}`));
        try {
          if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.totalResults != null) {
            setCurrentPage(nextPage);
            setResults(cachedResults);
            console.log("daaf");
            console.log(currentPage);
            setLoading(false);
            return;
          }
        }
        catch(e) {
          if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.data.Results.totalResults != null) {
            setCurrentPage(nextPage);
            setResults(cachedResults);
            console.log("daaf");
            console.log(currentPage);
            setLoading(false);
            return;
          }
        }
        fetch(`http://localhost:5000/search?q=${searchKey}&page=${nextPage}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Ошибка при получении данных');
            }
            return response.json();
          })
          .then(data => {
            try
            {
              setResults(data);
              setCurrentPage(nextPage);
              console.log(data);
              setTotalPages(Math.ceil(data.Results.totalResults / 20));
              localStorage.setItem(`${searchKey}-page-${nextPage}`, JSON.stringify({ data, timestamp: Date.now() }));
              setLoading(false);
            }
            catch(e)
            {
              setResults(data);
              setCurrentPage(nextPage);
              console.log(data);
              setTotalPages(Math.ceil(data.totalResults / 20));
              localStorage.setItem(`${searchKey}-page-${nextPage}`, JSON.stringify({ data, timestamp: Date.now() }));
              setLoading(false);
            }
            
          })
          .catch(error => console.error('Ошибка:', error))
          .finally(() => setLoading(false));
          setCurrentPage(nextPage);
          console.log("New currentPage:", nextPage);
          console.log(currentPage);
      } catch (error) {
        console.error('Ошибка:', error);
        setLoading(false);
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setLoading(true);
      try {
        const prevPage = currentPage - 1;
        const cachedResults = JSON.parse(localStorage.getItem(`${searchKey}-page-${prevPage}`));
        try
        {
          if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.totalResults != null) {
            setResults(cachedResults);
            setCurrentPage(prevPage);
            setLoading(false);
            return;
          }
        }
        catch(e)
        {
          if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.data.Results.totalResults != null) {
            setResults(cachedResults);
            setCurrentPage(prevPage);
            setLoading(false);
            return;
          }
        }
        fetch(`http://localhost:5000/search?q=${searchKey}&page=${prevPage}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Ошибка при получении данных');
            }
            return response.json();
          })
          .then(data => {
            try
            {
              setResults(data);
              setCurrentPage(prevPage);
              setTotalPages(Math.ceil(data.Results.totalResults / 20));
              localStorage.setItem(`${searchKey}-page-${prevPage}`, JSON.stringify({ data, timestamp: Date.now() }));
              setLoading(false);
            }
            catch(e)
            {
              setResults(data);
              setCurrentPage(prevPage);
              setTotalPages(Math.ceil(data.totalResults / 20));
              localStorage.setItem(`${searchKey}-page-${prevPage}`, JSON.stringify({ data, timestamp: Date.now() }));
              setLoading(false);
            }
            
          })
          .catch(error => console.error('Ошибка:', error))
          .finally(() => setLoading(false));
      } catch (error) {
        console.error('Ошибка:', error);
        setLoading(false);
      }
    }
  };

  const handlePageClick = (page) => {
    setLoading(true);
    try {
      const cachedResults = JSON.parse(localStorage.getItem(`${searchKey}-page-${page}`));
      try 
      {
        if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.totalResults != null) {
          setResults(cachedResults);
          setCurrentPage(page);
          setLoading(false);
          return;
        }
      }
      catch(e)
      {
        if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.data.Results.totalResults != null) {
          setResults(cachedResults);
          setCurrentPage(page);
          setLoading(false);
          return;
        }
      }
      fetch(`http://localhost:5000/search?q=${searchKey}&page=${page}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Ошибка при получении данных');
          }
          return response.json();
        })
        .then(data => {
          setResults(data);
          setCurrentPage(page);
          try
          {
            setTotalPages(Math.ceil(data.Results.totalResults / 20));
          }
          catch(e)
          {
            setTotalPages(Math.ceil(data.totalResults / 20));
          }
          localStorage.setItem(`${searchKey}-page-${page}`, JSON.stringify({ data, timestamp: Date.now() }));
          setLoading(false);
        })
        .catch(error => console.error('Ошибка:', error))
        .finally(() => setLoading(false));
    } catch (error) {
      console.error('Ошибка:', error);
      setLoading(false);
    }
  };

  return { searchKey, setSearchKey, results, currentPage, totalPages, loading, visiblePages, handleSearch, handleNextPage, handlePreviousPage, handlePageClick };
};

export default useNewsSearch;
