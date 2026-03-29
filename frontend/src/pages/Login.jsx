import { useEffect } from "react"

export default function Login() {
  useEffect(() => {
    window.location.href = "/dashboard"
  }, [])

  return null
}