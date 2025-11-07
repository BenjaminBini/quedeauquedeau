import { Card, CardBody } from '@heroui/react';
import { ActionCard } from './ActionCard';
import { categoryShortNames } from '../utils/database';

export function Dashboard({ allActions, categoryStats, totalActions, dateRange }) {
  const recentActions = allActions.slice(0, 10);
  const mostCommon = categoryStats.length > 0 ? categoryStats[0] : null;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-danger">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500 mb-2">
              Total Actions
            </p>
            <p className="text-4xl font-bold text-danger">
              {totalActions.toLocaleString()}
            </p>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-danger">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500 mb-2">
              Most Common Category
            </p>
            <p className="text-xl font-semibold text-default-900">
              {mostCommon ? (categoryShortNames[mostCommon.name] || mostCommon.name) : 'Loading...'}
            </p>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-danger">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500 mb-2">
              Date Range
            </p>
            <p className="text-xl font-semibold text-default-900">
              {dateRange}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Category Overview */}
      <Card>
        <CardBody>
          <h2 className="text-2xl font-bold text-default-900 mb-4">
            Threat Categories Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((stat) => {
              const percentage = ((stat.count / totalActions) * 100).toFixed(1);
              return (
                <div
                  key={stat.name}
                  className="p-4 bg-default-100 rounded-lg border-l-4 border-warning hover:translate-x-1 transition-transform"
                >
                  <h4 className="text-sm font-semibold text-default-900 mb-2">
                    {stat.short_name}
                  </h4>
                  <div className="text-2xl font-bold text-danger">
                    {stat.count.toLocaleString()}
                  </div>
                  <div className="text-xs text-default-500">
                    {percentage}% of all actions
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Recent Actions */}
      <Card>
        <CardBody>
          <h2 className="text-2xl font-bold text-default-900 mb-4">
            Most Recent Actions
          </h2>
          <div className="space-y-4">
            {recentActions.map((action, idx) => (
              <ActionCard key={idx} action={action} />
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
