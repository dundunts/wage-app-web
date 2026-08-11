"use client"

import { Checkbox as ChakraCheckbox } from "@chakra-ui/react"
import * as React from "react"

export type CheckboxProps = ChakraCheckbox.RootProps & {
  icon?: React.ReactNode
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export const Checkbox = React.forwardRef<HTMLLabelElement, CheckboxProps>(
  function Checkbox(props, ref) {
    const { icon, children, inputProps, ...rest } = props
    return (
      <ChakraCheckbox.Root ref={ref} {...rest}>
        <ChakraCheckbox.HiddenInput {...inputProps} />
        <ChakraCheckbox.Control>
          {icon ?? <ChakraCheckbox.Indicator />}
        </ChakraCheckbox.Control>
        {children && <ChakraCheckbox.Label>{children}</ChakraCheckbox.Label>}
      </ChakraCheckbox.Root>
    )
  },
)
