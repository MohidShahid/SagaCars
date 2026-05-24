import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout"
const layout = ({children}: {
  children: React.ReactNode;
}) => {
  return (
    <AdminPanelLayout >{children}</AdminPanelLayout >
  )
}

export default layout