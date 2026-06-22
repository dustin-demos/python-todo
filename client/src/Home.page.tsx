import { RiCheckboxBlankCircleLine, RiCheckboxCircleFill } from '@remixicon/vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { cva } from 'class-variance-authority'
import { defineComponent, ref } from 'vue'
import client from './client'

type Todo = {
  id: number
  title: string
  completed: boolean
}

const titleVariants = cva('flex-1 text-left transition-colors', {
  variants: {
    completed: {
      true: 'text-dark-100 line-through',
      false: 'text-white',
    },
  },
})

const TodoItem = defineComponent({
  name: 'TodoItem',
  props: {
    id: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['success'],
  setup (props, { emit }) {
    const { mutate } = useMutation({
      mutationFn: async () => {
        const { data } = await client.PUT('/todo/update/{todo_id}', {
          params: {
            path: { todo_id: props.id },
          },
          body: {
            completed: !props.completed,
          },
        })
        return data
      },
      onSuccess: () => {
        emit('success')
      },
    })

    return () => (
      <button class='flex w-full items-center gap-3 rounded-md px-6 py-3 text-left text-sm leading-6 transition-colors hover:bg-dark-300' onClick={() => { mutate() }}>
        {props.completed
          ? <RiCheckboxCircleFill class='size-5 shrink-0 text-primary'/>
          : <RiCheckboxBlankCircleLine class='size-5 shrink-0 text-dark-100'/>}
        <span class={titleVariants({ completed: props.completed })}>{props.title}</span>
      </button>
    )
  },
})

const ListTodos = defineComponent({
  name: 'ListTodos',
  setup (_props, { expose }) {
    const { data: todos, refetch } = useQuery({
      queryKey: ['todos'],
      queryFn: async () => {
        const { data } = await client.GET('/todo/list')
        return data || []
      },
      initialData: [],
    })

    expose({ refetch })

    return () => {
      if (todos.value.length === 0) {
        return <p class='py-6 text-center text-sm text-dark-100'>No todos yet. Add one above.</p>
      }

      return (
        <div class='grid gap-1'>
          {todos.value.map((todo: Todo) => (
            <TodoItem
              key={todo.id}
              completed={todo.completed}
              id={todo.id}
              title={todo.title}
              onSuccess={() => { refetch() }}
            />
          ))}
        </div>
      )
    }
  },
})

const CreateTodo = defineComponent({
  name: 'CreateTodo',
  emits: ['success'],
  setup (_props, { emit }) {
    const newTodo = ref('')

    const { mutate: createTodo } = useMutation({
      mutationFn: async () => {
        const { data } = await client.POST('/todo/create', {
          body: {
            title: newTodo.value,
            completed: false,
          },
        })
        return data
      },
      onSuccess: () => {
        newTodo.value = ''
        emit('success')
      },
    })

    const submit = () => {
      if (newTodo.value.trim()) createTodo()
    }

    return () => (
      <form class='grid grid-cols-[1fr_auto] gap-3' onSubmit={(event) => { event.preventDefault(); submit() }}>
        <input
          class='rounded-md border border-dark-300 bg-dark-500 px-3.5 text-lg leading-9 text-white outline-2 -outline-offset-1 outline-primary transition-colors placeholder:text-dark-100 focus:border-transparent focus:outline'
          placeholder='New todo'
          type='text'
          v-model={newTodo.value}
        />
        <button class='rounded-md bg-primary px-4 text-base font-semibold leading-9 text-dark-600 transition-colors hover:bg-primary-hover' type='submit'>
          Add Todo
        </button>
      </form>
    )
  },
})

export default defineComponent({
  name: 'HomePage',
  setup () {
    const listTodos = ref()

    const onSuccess = () => {
      if (listTodos.value) {
        listTodos.value.refetch()
      }
    }

    return () => (
      <div class='grid min-h-screen place-items-center p-6'>
        <div class='grid w-full max-w-[640px] gap-6 rounded-xl border border-dark-300 bg-dark-400 p-8'>
          <h1 class='text-3xl font-semibold leading-none text-white'>Python Todo</h1>
          <CreateTodo onSuccess={onSuccess}/>
          <ListTodos ref={listTodos}/>
        </div>
      </div>
    )
  },
})
