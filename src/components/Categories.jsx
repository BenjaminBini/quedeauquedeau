import { Card, CardBody } from '@heroui/react';
import { ActionCard } from './ActionCard';
import { categoryDescriptions } from '../utils/database';

export function Categories({ allActions, categoryStats }) {
  return (
    <div className="space-y-6">
      <Card className="bg-default-100 border-l-4 border-warning">
        <CardBody>
          <h2 className="text-2xl font-bold text-default-900 mb-2">
            Actions Grouped by Threat Category
          </h2>
          <p className="text-default-600">
            These categories help identify patterns of authoritarian behavior and threats to democratic institutions.
          </p>
        </CardBody>
      </Card>

      {categoryStats.map((stat) => {
        const actions = allActions.filter(action =>
          action.categories.includes(stat.name)
        );

        return (
          <Card key={stat.name}>
            <CardBody>
              <h3 className="text-xl font-bold text-danger mb-2 pb-2 border-b-2 border-default-200">
                {stat.short_name} ({stat.count} actions)
              </h3>
              <p className="text-sm text-default-500 mb-4">
                {categoryDescriptions[stat.name] || ''}
              </p>

              <div className="space-y-4">
                {actions.slice(0, 5).map((action, idx) => (
                  <ActionCard key={idx} action={action} />
                ))}
              </div>

              {stat.count > 5 && (
                <p className="text-sm text-default-500 mt-4">
                  ...and {stat.count - 5} more actions in this category
                </p>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
