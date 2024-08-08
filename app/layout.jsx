import {Roboto } from "next/font/google";

export const metadata = {
  title: "CIP Evoting",
  description:"Esta es la pagina para iniciar sesión",
  keywords: "voting, cip , evoting",
  

}

const roboto = Roboto({
  weight:["300","400","500","700"],
  style: ["italic","normal"],
  subsets: ["latin"],
})

export default function RootLayout({children}){
  
  return (
    <html lang="en">
      <body className={roboto.className}>{children}</body>
    </html>
  )
}
