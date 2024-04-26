import React, { useState, useEffect } from 'react';
import './assets/style.css';
import './assets/button.css';

const cacheExpirationTime = 60 * 60 * 1000;

function Home() {
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
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    setResults('');
  }, [searchKey]);

  const fetchData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Ошибка при получении данных');
    }
    return response.json();
  };

  const delayedFetch = async (url, delay) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        resolve(await fetchData(url));
      }, delay);
    });
  };

  useEffect(() => {
    if (results) {
      setLoading(false);
      console.log(results);
      if (currentPage===1)
      {
        try {
          if (results.totalResults >0)
          {
            console.log("Я тут");
            setTotalPages(Math.ceil(results.totalResults / 20));
          }
        }
        catch (error) {
          if (results.Results.totalResults >0)
          {
            console.log("Я тут");
            setTotalPages(Math.ceil(results.Results.totalResults / 20));
          }
        } 
        
      }
      else
        setTotalPages(Math.ceil(results.Results.totalResults / 20));
      console.log(currentPage);
      console.log(totalPages);
      console.log(!loading);

    }
  }, [results]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cachedResults = JSON.parse(localStorage.getItem(`${searchKey}-page-1`));
      console.log(cachedResults);
      if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.totalResults != null) {
        setResults(cachedResults);
        setCurrentPage(1);
        setLoading(false);
        return;
      }
  
      const response = await fetch(`http://localhost:5000/search?q=${searchKey}&page=1`);
      if (!response.ok) {
        throw new Error('Ошибка при получении данных');
      }
      const data = await delayedFetch(`http://localhost:5000/search?q=${searchKey}&page=1`, 1000);
      console.log(data);
      setResults(data);
      setCurrentPage(1);
      setTotalPages(Math.ceil(data.totalResults / 20));
      localStorage.setItem(`${searchKey}-page-${currentPage}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      setLoading(true);
      try {
        const nextPage = currentPage + 1;
        const cachedResults = JSON.parse(localStorage.getItem(`${searchKey}-page-${nextPage}`));
        console.log(cachedResults);
        console.log(cachedResults.data.Results);
        if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.data.Results.totalResults != null) {
          setCurrentPage(nextPage);
          setResults(cachedResults);
          console.log("Я тут2");
          console.log(currentPage);
          setLoading(false);
          return;
        }
        const data = await delayedFetch(`http://localhost:5000/search?q=${searchKey}&page=${nextPage}`, 1000);
        setResults(data);
        setCurrentPage(nextPage);
        setTotalPages(Math.ceil(data.Results.totalResults / 20));
        localStorage.setItem(`${searchKey}-page-${nextPage}`, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreviousPage = async () => {
    if (currentPage > 1) {
      setLoading(true);
      try {
        const prevPage = currentPage - 1;
        const cachedResults = JSON.parse(localStorage.getItem(`${searchKey}-page-${prevPage}`));
        console.log(cachedResults);
        if (prevPage===1)
          if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.totalResults != null) {
            setResults(cachedResults);
            setCurrentPage(prevPage);
            setLoading(false);
            return;
          }
        else
          if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.data.Results.totalResults != null) {
            setResults(cachedResults);
            setCurrentPage(prevPage);
            setLoading(false);
            return;
          }
        const data = await delayedFetch(`http://localhost:5000/search?q=${searchKey}&page=${prevPage}`, 1000);
        setResults(data);
        setCurrentPage(prevPage);
        console.log(prevPage);
        if (prevPage===1)
        {
          console.log(prevPage===1);
          setTotalPages(Math.ceil(results.totalResults / 20));
        }
        else
        {
          console.log(prevPage===1);
          console.log(results);
          console.log(data);
          console.log(Math.ceil(results.Results.totalResults / 20));
          setTotalPages(Math.ceil(results.Results.totalResults / 20));
        }
        localStorage.setItem(`${searchKey}-page-${prevPage}`, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageClick = async (page) => {
    setLoading(true);
    try {
      const cachedResults = JSON.parse(localStorage.getItem(`${searchKey}-page-${page}`));
      if (page===1)
        if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.totalResults != null) {
          setResults(cachedResults);
          setCurrentPage(page);
          setLoading(false);
          return;
        }
      else
        if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime && cachedResults.data.Results.totalResults != null) {
          setResults(cachedResults);
          setCurrentPage(page);
          setLoading(false);
          return;
        }
      const data = await delayedFetch(`http://localhost:5000/search?q=${searchKey}&page=${page}`, 1000);
      setResults(data);
      setCurrentPage(page);
      if (page===1)
      {
        setTotalPages(Math.ceil(results.totalResults / 20));
      }
      else
      {
        setTotalPages(Math.ceil(results.Results.totalResults / 20));
      }
      localStorage.setItem(`${searchKey}-page-${page}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <a className="logo" href="/">Новостное Демо</a>
        <form onSubmit={handleSearch}>
          <input
            autoFocus
            className="search-input"
            value={searchKey}
            placeholder="Введите тему новостей"
            type="search"
            name="q"
            onChange={(e) => setSearchKey(e.target.value)}
          />
        </form>
        <a href="https://github.com/DenisBoytsov41/GOproject/" className="button github-button">Просмотреть на Github</a>
      </header>
      <section className="container">
        {loading && <p>Загрузка...</p>}
        {!loading && results ? (
          <div className="result-count">
            {currentPage === 1 ? (
              results.totalResults > 0 ? (
                <p>Найдено <strong>{results.totalResults}</strong> новостей. Вы на странице <strong>{currentPage}</strong> из <strong>{totalPages}</strong>.</p>
              ) : (
                <p>Новости по запросу "<strong>{searchKey}</strong>" не найдены.</p>
              )
            ) : (
              results.Results.totalResults > 0 ? (
                <p>Найдено <strong>{results.Results.totalResults}</strong> новостей. Вы на странице <strong>{currentPage}</strong> из <strong>{totalPages}</strong>.</p>
              ) : (
                <p>Новости по запросу "<strong>{searchKey}</strong>" не найдены.</p>
              )
            )}
          </div>
        ) : null}
        {!loading && results && (
          currentPage === 1 ? (
            results.articles && Array.isArray(results.articles) && results.articles.length > 0 ? (
              <ul className="search-results">
                {results.articles.map((article, index) => (
                  <li key={index} className="news-article">
                    <div>
                      <a target="_blank" rel="noreferrer noopener" href={article.url}>
                        <h3 className="title">{article.title}</h3>
                      </a>
                      <p className="description">{article.description}</p>
                      <div className="metadata">
                        <p className="source">{article.source.name}</p>
                        <time className="published-date">{article.publishedAt}</time>
                      </div>
                    </div>
                    <img className="article-image" src={article.urlToImage} alt={article.title} />
                  </li>
                ))}
              </ul>
            ) : (
              <p>Новости по запросу "<strong>{searchKey}</strong>" не найдены.</p>
            )
          ) : (
            results.Results && results.Results.articles && Array.isArray(results.Results.articles) && results.Results.articles.length > 0 ? (
              <ul className="search-results">
                {results.Results.articles.map((article, index) => (
                  <li key={index} className="news-article">
                    <div>
                      <a target="_blank" rel="noreferrer noopener" href={article.url}>
                        <h3 className="title">{article.title}</h3>
                      </a>
                      <p className="description">{article.description}</p>
                      <div className="metadata">
                        <p className="source">{article.source.name}</p>
                        <time className="published-date">{article.publishedAt}</time>
                      </div>
                    </div>
                    <img className="article-image" src={article.urlToImage} alt={article.title} />
                  </li>
                ))}
              </ul>
            ) : null
          )
        )}
        {!loading && searchKey && results && totalPages > 0 ? (
          <div className="pagination">
            <button onClick={handlePreviousPage} className="button previous-page" disabled={currentPage === 1}>Предыдущая</button>
            <button onClick={handleNextPage} className="button next-page" disabled={currentPage === totalPages}>Следующая</button>
          </div>
        ) : null}
        {!loading && searchKey && results && totalPages > 0 ? (
          <div className="page-list">
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={currentPage === page ? "button active-page" : "button"}
              >
                {page}
              </button>
            ))}
          </div>
          ) : null
        }
      </section>
    </div>
  );
}

export default Home;
