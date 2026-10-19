import { createRouter, createWebHistory } from 'vue-router'
import SiteLayout from '../layout/SiteLayout.vue'
import AdminView from '../views/admin/index.vue'
import BookmarkView from '../views/bookmark/index.vue'
import HomeView from '../views/home/index.vue'
import ImagesView from '../views/images/index.vue'
import TrendsView from '../views/trends/index.vue'
import VideosView from '../views/videos/index.vue'
import WordsView from '../views/words/index.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: SiteLayout,
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'bookmark', name: 'bookmark', component: BookmarkView },
        { path: 'trends', name: 'trends', component: TrendsView },
        { path: 'images', name: 'images', component: ImagesView },
        { path: 'videos', name: 'videos', component: VideosView },
        { path: 'words', name: 'words', component: WordsView },
        { path: 'admin', name: 'admin', component: AdminView },
      ],
    },
  ],
})
