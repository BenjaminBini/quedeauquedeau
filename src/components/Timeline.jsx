import { useState, useMemo } from 'react';
import { Card, CardBody, Select, SelectItem } from '@heroui/react';
import { ActionCard } from './ActionCard';

export function Timeline({ allActions, categoryStats }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const filteredActions = useMemo(() => {
    let actions = [...allActions];

    // Filter by category
    if (selectedCategory !== 'all') {
      actions = actions.filter(action =>
        action.categories.includes(selectedCategory)
      );
    }

    // Sort
    if (sortOrder === 'oldest') {
      actions.reverse();
    }

    return actions;
  }, [allActions, selectedCategory, sortOrder]);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h2 className="text-2xl font-bold text-default-900 mb-4">
            Timeline of Actions
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              label="Filter by Category"
              selectedKeys={[selectedCategory]}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              label="Sort by"
              selectedKeys={[sortOrder]}
              onChange={(e) => setSortOrder(e.target.value)}
              className="flex-1"
            >
              <SelectItem key="newest" value="newest">
                Newest First
              </SelectItem>
              <SelectItem key="oldest" value="oldest">
                Oldest First
              </SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      <div className="relative pl-8">
        {/* Timeline line */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-default-300" />

        {filteredActions.map((action, idx) => (
          <div key={idx} className="relative mb-8">
            {/* Timeline dot */}
            <div className="absolute left-[-33px] top-2 w-3 h-3 rounded-full bg-danger" />

            <ActionCard action={action} />
          </div>
        ))}
      </div>
    </div>
  );
}
