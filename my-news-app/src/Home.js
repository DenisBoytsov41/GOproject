import React, { useState, useEffect } from 'react';
import './assets/style.css';
import './assets/button.css'

function Home() {
  const [searchKey, setSearchKey] = useState('');
  const [results, setResults] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/search?q=${searchKey}`);
      if (!response.ok) {
        throw new Error('Ошибка при получении данных');
      }
      const data = await response.json();
      setResults(data);
      setCurrentPage(1);
      if (data.Results.articles && data.Results.articles.length > 0) {
        setTotalPages(Math.ceil(data.Results.totalResults / 20));
      }
      
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleNextPage = async () => {
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
    }
  };

  useEffect(() => {
    console.log(results);
    if (results.Results != null) {
      console.log(results.Results.articles);
      console.log(Array.isArray(results.Results.articles));
      console.log(results.Results.articles.length);
    }
  }, [results]);

  const handlePreviousPage = async () => {
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
    }
  };

  const handlePageClick = async (page) => {
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
        {results ? (
          <div className="result-count">
            {results.Results.totalResults > 0 ? (
              <p>Найдено <strong>{results.Results.totalResults}</strong> новостей. Вы на странице <strong>{currentPage}</strong> из <strong>{totalPages}</strong>.</p>
            ) : (
              <p>Новости по запросу "<strong>{searchKey}</strong>" не найдены.</p>
            )}
          </div>
        ) : null}
        {results && results.Results.articles && Array.isArray(results.Results.articles) && results.Results.articles.length > 0 ? (
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
        ) : null}

        {results && totalPages > 0 ? (
          <div className="pagination">
            {currentPage > 1 && (
              <button onClick={handlePreviousPage} className="button previous-page">Предыдущая</button>
            )}
            {currentPage < totalPages && (
              <button onClick={handleNextPage} className="button next-page">Следующая</button>
            )}
          </div>
        ) : null}
        <div className="page-list">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={currentPage === page ? "button active-page" : "button"}
            >
              {page}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
