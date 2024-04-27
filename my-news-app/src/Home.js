import React, { useState, useEffect } from 'react';
import './assets/style.css';
import './assets/button.css';
import useNewsSearch from './useNewsSearch';

function Home() {
  const { searchKey, setSearchKey, results, currentPage, totalPages, loading, visiblePages, handleSearch, handleNextPage, handlePreviousPage, handlePageClick } = useNewsSearch();

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
        {loading && !results && <p>Загрузка...</p>}
        {!loading && results ? (
          <div className="result-count">
          {(() => {
            try {
              if (results.Results.totalResults > 0) {
                return (
                  <p>Найдено <strong>{results.Results.totalResults}</strong> новостей. Вы на странице <strong>{currentPage}</strong> из <strong>{totalPages}</strong>.</p>
                );
              } else {
                return (
                  <p>Новости по запросу "<strong>{searchKey}</strong>" не найдены.</p>
                );
              }
            } catch (error) {
              try {
                if (results.totalResults > 0) {
                  return (
                    <p>Найдено <strong>{results.totalResults}</strong> новостей. Вы на странице <strong>{currentPage}</strong> из <strong>{totalPages}</strong>.</p>
                  );
                } else {
                  return (
                    <p>Новости по запросу "<strong>{searchKey}</strong>" не найдены.</p>
                  );
                }
              } catch (error) {
                console.error('Ошибка при рендеринге результатов поиска:', error);
                return null;
              }
            }
          })()}
        </div>        
        ) : null}
        {!loading && results && (
          (() => {
            try {
              if (results.Results.articles && Array.isArray(results.Results.articles) && results.Results.articles.length > 0) {
                return (
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
                );
              } else {
                return null;
              }
            } catch (error) {
              try {
                if (results && results.articles && Array.isArray(results.articles) && results.articles.length > 0) {
                  return (
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
                  );
                } else {
                  return null;
                }
              } catch (error) {
                console.error('Ошибка при рендеринге результатов поиска:', error);
                return null;
              }
            }
          })()
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
