import { GetStaticPaths, GetStaticProps } from 'next';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { RichText } from 'prismic-dom'
import { getPrismicClient } from '../../services/prismic';

import { Header } from '../../components/Header'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiUser, FiCalendar, FiClock } from "react-icons/fi";
import { IconContext } from 'react-icons'

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const onlyWordsRegex = new RegExp('\\w')
  const onlySpacesRegex = new RegExp(String.fromCharCode(160), "g")

  const wordsArray = post?.data.content.reduce((acc, content) => {
    return [...acc, ...content.heading.replace(onlySpacesRegex, ' ').split(' '), ...RichText.asText(content.body).replace(onlySpacesRegex, ' ').split(' ')]
  }, []).filter(string => string.match(onlyWordsRegex))

  const readingTime = Math.ceil(wordsArray.length / 200)

  return (
    <>
      <Header />
      {
        post ?
          (<>
            <div className={ styles.banner }>
              <img src={ post.data.banner.url } alt={ post.data.title } />
            </div>
            <main className={ commonStyles.container }>
              <div className={ styles.content }>
                <header>
                  <h1>{ post.data.title }</h1>
                  <div>
                    <IconContext.Provider value={ { size: '1.5rem' } }>
                      <p><span><FiCalendar /></span>{ post.first_publication_date }</p>
                      <p><span><FiUser /></span>{ post.data.author }</p>
                      <p><span><FiClock /></span>{ readingTime + ' min' }</p>
                    </IconContext.Provider>
                  </div>
                </header>
                <article>
                  {
                    post.data.content.map(content => {
                      return (
                        <div key={ content.heading }>
                          <h2>{ content.heading }</h2>
                          <div dangerouslySetInnerHTML={ { __html: RichText.asHtml(content.body) } } />
                          {/* { RichText.asHtml(content.body) } */ }
                        </div>
                      )
                    })
                  }
                </article>
              </div>
            </main>
          </>
          )
          : (
            <main className={ styles.Loading }>
              <h1>Carregando....</h1>
            </main>
          )
      }
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  return {
    paths: [
      { params: { slug: 'nextjs-novidades-na-versao-10-e-atualizacao-do-blog-para-melhorar-a-performance' } }
    ],
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    uid: response.uid,
    first_publication_date:
      format(
        new Date(response.first_publication_date),
        "dd MMM y",
        {
          locale: ptBR,
        }
      ),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: { url: response.data.banner.url },
      author: response.data.author,
      content: response.data.content,
    },
  }

  return {
    props: { post },
    revalidate: 60 * 30 // 30 min
  }
};
