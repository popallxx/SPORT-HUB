import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import CourtCard from '../components/CourtCard'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import { CourtGridSkeleton } from '../components/Skeleton'

export default function Courts() {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')

  const load = () => {
    api
      .get('/courts')
      .then((res) => {
        setCourts(res.data.data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Gagal memuat data lapangan')
        setLoading(false)
      })
  }

  useEffect(load, [])

  const types = ['All', ...new Set(courts.map((c) => c.type))]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courts.filter((c) => {
      const matchType = filter === 'All' || c.type === filter
      const matchQuery =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      return matchType && matchQuery
    })
  }, [courts, filter, query])

  return (
    <div className="page-fade">
      <section className="sh-section" style={{ paddingBottom: 0 }}>
        <div className="sh-container">
          <div className="text-center mb-4">
            <span className="section-index"><strong>01</strong> COURTS</span>
            <h1 className="section-title mt-3">FIND YOUR COURT</h1>
            <p className="section-subtitle">Choose your arena. Book your next game.</p>
          </div>

          {!loading && !error && courts.length > 0 && (
            <div className="d-flex flex-column align-items-center gap-3 mb-5">
              <div className="sh-search">
                <span className="sh-search-icon" aria-hidden="true">
                  <Icon name="search" size={17} />
                </span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Cari lapangan, tipe, atau fasilitas..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Cari lapangan"
                />
              </div>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <div className="filter-pills segmented" role="group" aria-label="Filter tipe lapangan">
                  {types.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`filter-pill ${filter === t ? 'active' : ''}`}
                      onClick={() => setFilter(t)}
                      aria-pressed={filter === t}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {(query || filter !== 'All') && (
                <p className="text-muted small mb-0">
                  {filtered.length} hasil
                  {query && (
                    <>
                      {' '}untuk “<strong>{query}</strong>”
                    </>
                  )}
                  {' '}
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-accent"
                    onClick={() => {
                      setQuery('')
                      setFilter('All')
                    }}
                  >
                    Reset
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="sh-section" style={{ paddingTop: 0 }}>
        <div className="sh-container">
          {loading ? (
            <CourtGridSkeleton count={6} />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() => {
                setLoading(true)
                load()
              }}
            />
          ) : filtered.length === 0 ? (
            courts.length > 0 ? (
              <EmptyState
                icon="search"
                title="NO COURTS FOUND"
                message={
                  query
                    ? `Tidak ada hasil untuk “${query}”${filter !== 'All' ? ` tipe ${filter}` : ''}.`
                    : `Belum ada lapangan tipe ${filter}. Coba tipe lain.`
                }
                action={
                  <button
                    type="button"
                    className="btn btn-accent"
                    onClick={() => {
                      setQuery('')
                      setFilter('All')
                    }}
                  >
                    <Icon name="refresh" size={16} />
                    SHOW ALL
                  </button>
                }
              />
            ) : (
              <EmptyState
                icon="shuttle"
                title="NO COURTS AVAILABLE"
                message="There are no courts available right now."
                action={
                  <button
                    type="button"
                    className="btn btn-accent"
                    onClick={() => {
                      setFilter('All')
                      setQuery('')
                      setLoading(true)
                      load()
                    }}
                  >
                    <Icon name="refresh" size={16} />
                    TRY AGAIN
                  </button>
                }
              />
            )
          ) : (
            <div className="row g-4">
              {filtered.map((court, i) => (
                <div key={court.id} className="col-md-6 col-lg-4">
                  <Reveal delay={(i % 3) * 70}>
                    <CourtCard court={court} />
                  </Reveal>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
