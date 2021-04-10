import styles from './header.module.scss'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Header() {
  const router = useRouter()

  return (
    <header className={ styles.headerContainer }>
      <Link href='/'>
        <a className={ styles.headerContent }>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
