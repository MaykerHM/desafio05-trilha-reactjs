import { GetStaticProps } from 'next';
import Link from 'next/link'

import Prismic from '@prismicio/client'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiUser, FiCalendar } from "react-icons/fi";
import { IconContext } from 'react-icons'

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination: { next_page, results } }: HomeProps) {
  return (
    <>
      <main className={ styles.container }>
        <div className={ styles.posts }>
          {
            results.map(post => {
              return (
                <Link href={ `/post/${post.uid}` } key={ post.uid }>
                  <a>
                    <h1>{ post.data.title }</h1>
                    <h2>{ post.data.subtitle }</h2>
                    <div>
                      <IconContext.Provider value={ { size: '1.5rem' } }>
                        <p><span><FiCalendar /></span>{ post.first_publication_date }</p>
                        <p><span><FiUser /></span>{ post.data.author }</p>
                      </IconContext.Provider>
                    </div>
                  </a>
                </Link>
              )
            })
          }
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ]);

  const posts = postsResponse.results.map(post => {
    const month = (new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
      month: 'long',
    })).slice(0, 3)
    return {
      uid: post.uid,
      first_publication_date: `${(new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
      }))} ${month.charAt(0).toUpperCase() + month.slice(1)} ${(new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
        year: 'numeric'
      }))}`,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      }
    }
  }
};
