import styles from './header.module.scss'
import { useRouter } from 'next/router'
import Link from 'next/link'

export function Header() {
  const router = useRouter()

  return (
    <header className={ `${styles.headerContainer} ${router.pathname === '/' ? styles.headerHomeMargin : ''}` }>
      <Link href='/'>
        <a className={ styles.headerContent }>
          <img src="/Logo.svg" alt="Logo" />
        </a>
      </Link>
    </header>
  )
}
