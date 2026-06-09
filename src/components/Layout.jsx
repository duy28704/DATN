import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';

function Layout({children}) {
    return (
      <>
        <Header/>
    

        <Sidebar />

        {children}
       
        <Footer/>
      </>
    )
}
export default Layout