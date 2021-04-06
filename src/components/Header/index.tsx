import styles from './header.module.scss'

export function Header() {
  return (
    <header className={ styles.headerContainer }>
      <div className={ styles.headerContent }>
        <img src="/images/Logo.svg" alt="Logo" />
      </div>
    </header>
  )
}
