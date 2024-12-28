import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function SidepanelTabs() {
  return (
    <Tabs defaultValue="categories" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="categories">categories</TabsTrigger>
        <TabsTrigger value="all">all</TabsTrigger>
      </TabsList>
      <TabsContent value="categories"></TabsContent>
      <TabsContent value="all"></TabsContent>
    </Tabs>
  );
}
