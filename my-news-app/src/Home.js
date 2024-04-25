import React, { useState, useEffect } from 'react';
import './assets/style.css';
import './assets/button.css';

const cacheExpirationTime = 60 * 60 * 1000;

function Home() {
  const [searchKey, setSearchKey] = useState(localStorage.getItem('searchKey') || '');
  const [results, setResults] = useState('');
  const [currentPage, setCurrentPage] = useState(parseInt(localStorage.getItem('currentPage'), 10) || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [visiblePagesCount] = useState(10);
  const [visiblePages, setVisiblePages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (results && results.totalResults != null) {
      setTotalPages(Math.ceil(results.totalResults / 20));
    }
  }, [results]);

  useEffect(() => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePagesCount / 2));
    const endPage = Math.min(totalPages, startPage + visiblePagesCount - 1);

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => index + startPage);
    setVisiblePages(pages);
  }, [currentPage, totalPages, visiblePagesCount]);

  useEffect(() => {
    localStorage.setItem('searchKey', searchKey);
  }, [searchKey]);

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Сбрасываем текущую страницу при изменении поискового запроса
    setResults(''); // Сбрасываем результаты при изменении поискового запроса
  }, [searchKey]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cachedResults = JSON.parse(localStorage.getItem(searchKey));
      if (cachedResults && Date.now() - cachedResults.timestamp < cacheExpirationTime) {
        setResults(cachedResults);
        setCurrentPage(1);
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/search?q=${searchKey}`);
      if (!response.ok) {
        throw new Error('Ошибка при получении данных');
      }
      const data = await response.json();
      setResults(data);
      setCurrentPage(1);
      localStorage.setItem(searchKey, JSON.stringify(data));
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
        const response = await fetch(`http://localhost:5000/search?q=${searchKey}&page=${currentPage + 1}`);
        if (!response.ok) {
          throw new Error('Ошибка при получении данных');
        }
        const data = await response.json();
        setResults(data);
        setCurrentPage(currentPage + 1);
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
        const response = await fetch(`http://localhost:5000/search?q=${searchKey}&page=${currentPage - 1}`);
        if (!response.ok) {
          throw new Error('Ошибка при получении данных');
        }
        const data = await response.json();
        setResults(data);
        setCurrentPage(currentPage - 1);
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
      const response = await fetch(`http://localhost:5000/search?q=${searchKey}&page=${page}`);
      if (!response.ok) {
        throw new Error('Ошибка при получении данных');
      }
      const data = await response.json();
      setResults(data);
      setCurrentPage(page);
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
            {results.totalResults > 0 ? (
              <p>Найдено <strong>{results.totalResults}</strong> новостей. Вы на странице <strong>{currentPage}</strong> из <strong>{totalPages}</strong>.</p>
            ) : (
              <p>Новости по запросу "<strong>{searchKey}</strong>" не найдены.</p>
            )}
          </div>
        ) : null}
        {!loading && results && results.articles && Array.isArray(results.articles) && results.articles.length > 0 ? (
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
        ) : null}
        {!loading && searchKey && results && totalPages > 0 ? (
          <div className="pagination">
            <button onClick={handlePreviousPage} className="button previous-page" disabled={currentPage === 1}>Предыдущая</button>
            <button onClick={handleNextPage} className="button next-page" disabled={currentPage === totalPages}>Следующая</button>
          </div>
        ) : null}
        {!loading && searchKey && (currentPage !== 1 || currentPage !== totalPages) && (
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
        )}
      </section>
    </div>
  );
}

export default Home;
