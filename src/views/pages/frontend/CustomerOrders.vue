<template>
  <div>
    <loading :active.sync="isLoading"></loading>

    <div class="container">
      <div
        id="stared__none"
        v-if="stared.length === 0 && productType === 'stared'"
      >
        <p
          class="h3 text-primary border border-primary rounded p-3 text-center"
        >
          目前關注清單暫無內容，眾多商品歡迎選購！
          <router-link class="nav-link text-danger" to="/customer_orders/all"
            >點我來去逛逛<i class="far fa-hand-point-left"></i
            ><i class="far fa-hand-point-left"></i
            ><i class="far fa-hand-point-left"></i
          ></router-link>
        </p>
      </div>

      <div class="row mt-4">
        <div
          class="col-md-3 mb-4"
          v-for="item in filterProducts"
          :key="item.id"
        >
          <div class="card border-0 shadow-sm card--hover">
            <a
              href="#"
              @click.prevent="getProduct(item.id)"
              class="text-decoration-none"
            >
              <div
                class="mask-toggle img img--mid"
                :style="{ backgroundImage: `url(${item.imageUrl})` }"
              >
                <div class="mask h-100"></div>
                <a
                  class="heart heart-regular h3 text-danger"
                  @click.prevent.stop="changeStared(item.id, item.title)"
                  v-if="!stared.includes(item.id)"
                  ><i class="far fa-heart"></i
                ></a>
                <a
                  class="heart h3 text-danger"
                  :class="{ active: stared.includes(item.id) }"
                  @click.prevent.stop="changeStared(item.id, item.title)"
                  ><i class="fas fa-heart"></i
                ></a>
              </div>
              <div class="card-body">
                <blockquote class="blockquote text-left mb-0">
                  <p class="mb-0 text-truncate" :title="item.title">
                    {{ item.title }}
                  </p>

                  <footer class="blockquote-footer mb-0 text-right">
                    <cite title="Source Title">{{ item.category }}</cite>
                  </footer>
                </blockquote>
                <div class="h5 text-right mt-2">
                  NT{{ item.price | Currency }}
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <Pagination
        :pagination="controlPagination"
        v-on:getpagination="getProducts"
      ></Pagination>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination.vue'

export default {
  data () {
    return {
      allProducts: [],
      isLoading: false,
      pagination: {},
      stared: JSON.parse(localStorage.getItem('personalProduct')) || [],
      productType: '',
      productList: {
        all: 'all',
        key_ring: '包與鑰的事',
        earring: '耳朵上的事',
        tray: '桌上的好事',
        technology: '掌心的小事'
      }
    }
  },
  components: {
    Pagination
  },
  computed: {
    filterProducts () {
      const vm = this
      let products = []
      if (vm.productType === 'all') {
        products = vm.allProducts
      } else if (vm.productList[vm.productType]) {
        products = vm.allProducts.filter(e => {
          return e.category === vm.productList[vm.productType]
        })
      } else if (vm.productType === 'stared') {
        products = vm.allProducts.filter(e => vm.stared.includes(e.id))
      }
      return products
    },
    controlPagination () {
      const vm = this
      let controlPagination = {}
      if (vm.productType === 'all') {
        controlPagination = vm.pagination
      }
      return controlPagination
    }
  },
  methods: {
    getProducts (page = 1) {
      const vm = this
      let api = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/products/all`

      if (vm.productType === 'all') {
        api = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/products?page=${page}`
      }

      vm.isLoading = true
      vm.$http.get(api).then(res => {
        vm.allProducts = res.data.products.filter(e => e.is_enabled === 1)
        vm.pagination = res.data.pagination
        vm.isLoading = false
      })
    },
    getProduct (id) {
      this.$router.push({ path: `/product_detail/${id}` })
    },
    changeStared (id, title) {
      const vm = this
      const msg = {
        title: `『${title}』已加入關注清單`,
        content: `謝謝您喜歡『${title}』！`,
        creat_at: Date.now(),
        href: `#/product_detail/${id}`
      }

      if (!vm.stared.includes(id)) {
        vm.stared.push(id)
      } else {
        vm.stared.splice(
          vm.stared.findIndex(e => e === id),
          1
        )
        msg.title = `『${title}』已從關注清單移除`
        msg.content = '本店有眾多商品歡迎繼續選購'
      }
      vm.$bus.$emit('message:dropdown', msg)
      vm.$bus.$emit('message:push', msg.title, 'success')

      localStorage.setItem('personalProduct', JSON.stringify(vm.stared))

      const count = vm.stared.length
      vm.$bus.$emit('iconCount:change', 'heart', count)

      vm.getProducts()
    }
  },
  created () {
    const vm = this
    vm.productType = vm.$route.params.productType
    if (vm.productList[vm.productType] || vm.productType === 'stared') {
      vm.getProducts()
    } else {
      vm.$router.push({ path: '/' })
    }
  },
  watch: {
    $route () {
      this.productType = this.$route.params.productType
      this.getProducts()
    }
  }
}
</script>
