import { createContext, useContext } from 'react'
import useForm from '../hooks/useForm'

type FormMethods = ReturnType<typeof useForm>

const FormContext = createContext<FormMethods>({} as unknown as FormMethods)

type FormProps = FormMethods & {
  children: React.ReactNode
}

export const Form: React.FC<FormProps> = ({ children, ...props }) => {
  return <FormContext.Provider value={props}>{children}</FormContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFormContext = () => useContext(FormContext)
