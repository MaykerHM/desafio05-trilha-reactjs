import { useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header'

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
interface OtherPost {
  uid?: string;
  title: string;
}

interface PostProps {
  post: Post;
  nextPost: OtherPost;
}

export default function Post({ post, nextPost }: PostProps) {
  const onlyWordsRegex = new RegExp('\\w')
  const onlySpacesRegex = new RegExp(String.fromCharCode(160), "g")

  const wordsArray = post?.data.content.reduce((acc, content) => {
    return [...acc, ...content.heading.replace(onlySpacesRegex, ' ').split(' '), ...RichText.asText(content.body).replace(onlySpacesRegex, ' ').split(' ')]
  }, []).filter(string => string.match(onlyWordsRegex))

  const readingTime = Math.ceil(wordsArray.length / 200)

  const router = useRouter()

  if (router.isFallback) {
    return (
      <main className={ styles.Loading }>
        <h1>Carregando...</h1>
      </main>
    )
  }

  useEffect(() => {
    let script = document.createElement("script");
    let anchor = document.getElementById("inject-comments-for-uterances");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", "true");
    script.setAttribute("repo", "MaykerHM/desafio05-trilha-reactjs");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "photon-dark");
    anchor.appendChild(script);
  }, [])


  return (
    <>
      <Header />
      {
        <>
          <div className={ styles.banner }>
            <img src={ post.data.banner.url } alt={ post.data.title } />
          </div>
          <main className={ commonStyles.container }>
            <div className={ styles.content }>
              <header>
                <h1>{ post.data.title }</h1>
                <div>
                  <IconContext.Provider value={ { size: '1.5rem' } }>
                    <p><span><FiCalendar /></span>{ format(
                      new Date(post.first_publication_date),
                      "dd MMM y",
                      {
                        locale: ptBR,
                      }
                    ) }</p>
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
              <footer>
                <hr />
                <div>
                  <div>
                    <h1></h1>
                    <a>Post anterior</a>
                  </div>
                  <div>
                    <h1>${ nextPost?.title }</h1>
                    <a>Próximo post</a>
                  </div>
                </div>
                <div id="inject-comments-for-uterances"></div>
              </footer>
            </div>
          </main>
        </>
      }
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content']
    });

  const paths = posts.results.map(post => ({
    params: { slug: post.uid }
  }))

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: { url: response.data.banner.url },
      author: response.data.author,
      content: response.data.content,
    },
  }

  const nextPostResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
    });

  const nextPost: OtherPost = {
    uid: nextPostResponse.results[0].uid,
    title: nextPostResponse.results[0].data.title,
  }

  return {
    props: { post, nextPost },
    revalidate: 60 * 30 // 30 min
  }
};
