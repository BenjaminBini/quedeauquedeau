import { useState, useMemo } from 'react';
import { Card, CardBody, Input, Select, SelectItem, Button, Pagination } from '@heroui/react';
import { ActionCard } from './ActionCard';

export function Browse({ allActions, categoryStats }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredActions = useMemo(() => {
    return allActions.filter(action => {
      const matchesSearch = action.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || action.categories.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [allActions, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredActions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActions = filteredActions.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value) => {
    const newValue = value === 'all' ? filteredActions.length : parseInt(value);
    setItemsPerPage(newValue);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h2 className="text-2xl font-bold text-default-900 mb-4">
            Browse All Actions
          </h2>

          <Input
            type="text"
            label="Search"
            placeholder="Search actions by title or description..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="mb-4"
          />

          <div className="flex flex-col md:flex-row gap-4">
            <Select
              label="Filter by Category"
              selectedKeys={[selectedCategory]}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1"
            >
              <SelectItem key="all" value="all">
                All Categories
              </SelectItem>
              {categoryStats.map((stat) => (
                <SelectItem key={stat.name} value={stat.name}>
                  {stat.short_name}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Items per page"
              selectedKeys={[itemsPerPage.toString()]}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="flex-1"
            >
              <SelectItem key="25" value="25">25</SelectItem>
              <SelectItem key="50" value="50">50</SelectItem>
              <SelectItem key="100" value="100">100</SelectItem>
              <SelectItem key="all" value="all">All</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-4">
        {paginatedActions.map((action, idx) => (
          <ActionCard key={idx} action={action} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            color="danger"
            showControls
          />
        </div>
      )}
    </div>
  );
}
