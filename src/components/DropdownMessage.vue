<template>
  <div>
    <ul
      class="DropdownMessage border border-primary p-3 rounded"
      v-if="msgOpen"
    >
      <li class="list-group mb-2" v-if="msg.length < 1">
        <a
          href="#"
          class="list-group-item list-group-item-action text-center disabled"
        >
          <p class="mb-1">
            目前沒有新通知
          </p>
        </a>
      </li>
      <li
        class="list-group mb-2"
        v-for="(item, index) in msg"
        :key="item.creat_at"
      >
        <a :href="item.href" class="list-group-item list-group-item-action">
          <div class="d-flex w-100 justify-content-between">
            <h5>{{ item.title }}</h5>
            <button
              type="button"
              class="close"
              aria-label="Close"
              @click.stop="deleteMsg(index)"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <p class="mb-1">
            {{ item.content }}
          </p>
          <small>{{ item.creat_at | TimeChange }}</small>
        </a>
      </li>
      <button
        type="button"
        class="btn btn-primary btn-block"
        @click.stop="deleteMsg('all')"
        :disabled="msg.length < 1"
      >
        清除所有通知
      </button>
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
      msg: [
        {
          title: '歡迎來到Dalla Goods！',
          content:
            '這裡有多樣精心製作的手作小物，每一個都是獨一無二的，希望您會喜歡。',
          creat_at: Date.now(),
          href: '#'
        }
      ]
    }
  },
  props: {
    msgOpen: { type: Boolean, default: false }
  },
  methods: {
    deleteMsg (index) {
      const vm = this
      if (index === 'all') {
        vm.msg = []
      } else {
        vm.msg.splice(index, 1)
      }
      vm.updateIconCount()
    },
    updateMessage (message) {
      const vm = this
      vm.msg.push(message)
      vm.updateIconCount()
    },
    updateIconCount () {
      const vm = this
      const count = vm.msg.length
      vm.$emit('msgCount', count, 'msg')
    }
  },
  created () {
    const vm = this
    vm.$bus.$on('message:dropdown', message => vm.updateMessage(message))
    vm.updateIconCount()
  }
}
</script>
