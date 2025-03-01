<template>
  <div>
    <loading :active.sync="isLoading"></loading>

    <div class="container pt-5" v-if="cart.products.length === 0">
      <p class="h3 text-primary border border-primary rounded p-3 text-center">
        目前購物車內暫無內容，眾多商品歡迎選購！
        <router-link class="nav-link text-danger" to="/customer_orders/all"
          >點我來去逛逛<i class="far fa-hand-point-left"></i
          ><i class="far fa-hand-point-left"></i
          ><i class="far fa-hand-point-left"></i
        ></router-link>
      </p>
    </div>

    <div class="container" v-else>
      <ShoppingStep></ShoppingStep>
      <div class="row justify-content-center">
        <div class="col-10 col-md-8">
          <section
            class="row mb-4"
            v-for="item in cart.products"
            :key="item.id"
          >
            <div class="col-md-4">
              <div
                class="h-100 img img--mid"
                :style="{ backgroundImage: `url(${item.imageUrl})` }"
              ></div>
            </div>

            <div class="col-md-8">
              <div class="border p-3 mb-3">
                <button
                  type="button"
                  class="close"
                  @click="changeCart(item.id, 0, item.title)"
                >
                  <i
                    class="fas fa-spinner fa-spin"
                    v-if="status.loadingItem === item.id"
                  ></i>
                  <span aria-hidden="true" v-else>&times;</span>
                </button>
                <blockquote class="blockquote text-left">
                  <p class="mb-0 text-truncate" :title="item.title">
                    {{ item.title }}
                  </p>
                  <footer class="blockquote-footer pl-5">
                    {{ item.description }}
                  </footer>
                </blockquote>
                <div v-if="item.coupon" class="text-success">已套用優惠券</div>
              </div>

              <div class="d-flex border p-3 justify-content-between">
                <div class="d-flex align-items-center">
                  <button
                    type="button"
                    :disabled="item.num === 1 || isLoading"
                    :class="{ 'input--disabled': item.num === 1 || isLoading }"
                    class="btn btn-outline-primary"
                    @click="changeCart(item.id, -1, item.title)"
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="mx-2">{{ item.num }}</span>
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    :disabled="isLoading"
                    @click="changeCart(item.id, +1, item.title)"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>

                <div class="d-sm-flex align-items-center">
                  <p class="m-0 p-2 border-right text-gray small">
                    NT{{ item.price | Currency }}/{{ item.unit }}
                  </p>
                  <p class="m-0 p-2 text-primary h5">
                    NT{{ (item.price * item.num) | Currency }}
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section class="row justify-content-end">
            <div class="col-md-6 col-xl-4 text-center">
              <p class="h3 border-bottom mb-3 p-3">
                總計: <span>NT{{ cart.total | Currency }}</span>
              </p>
              <button
                type="button"
                class="btn btn-primary btn-lg mb-3 mb-md-0"
                @click="addToCart"
              >
                結帳去
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ShoppingStep from '@/components/ShoppingStep.vue'

export default {
  data () {
    return {
      isLoading: false,
      cart: JSON.parse(localStorage.getItem('personalCart')) || {
        products: []
      },
      status: {
        loadingItem: ''
      }
    }
  },
  methods: {
    changeCart (productID, changeQty, productTitle) {
      const vm = this
      const productIndex = vm.cart.products.findIndex(e => e.id === productID)
      const msg = {
        title: ''
      }
      vm.status.loadingItem = productID

      if (changeQty === 0) {
        vm.cart.products.splice(productIndex, 1)
        msg.title = `『${productTitle}』已至購物車移除`
      } else {
        vm.cart.products[productIndex].num += changeQty
        msg.title = `『${productTitle}』數量已更新`
      }
      vm.updateTotal()
      localStorage.setItem('personalCart', JSON.stringify(vm.cart))

      setTimeout(() => {
        vm.status.loadingItem = ''
      }, 500)

      vm.$bus.$emit('message:push', msg.title, 'success')
      vm.$bus.$emit('carts:Update')
    },
    updateTotal () {
      const vm = this
      vm.cart.total = vm.cart.products.reduce((total, e) => {
        return total + e.price * e.num
      }, 0)
    },
    addToCart () {
      const vm = this
      const api = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/cart`
      let addProduct = {}
      vm.isLoading = true
      vm.cart.products.forEach(e => {
        addProduct = {
          product_id: e.id,
          qty: e.num
        }
        vm.$http.post(api, { data: addProduct }).then(() => {})
      })
      setTimeout(() => {
        vm.isLoading = false
        vm.$router.push('/customer_form')
      }, 1000)
    },
    cleanCart () {
      const vm = this
      const api = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/cart`

      vm.$http.get(api).then(res => {
        if (res.data.data.carts.length > 0) {
          const carts = res.data.data.carts
          carts.forEach(e => {
            const delapi = `${process.env.VUE_APP_APIPATH}/api/${process.env.VUE_APP_CUSTOMPATH}/cart/${e.id}`
            vm.$http.delete(delapi).then(() => {})
          })
        }
      })
    }
  },
  components: {
    ShoppingStep
  },
  created () {
    this.cleanCart()
  }
}
</script>
