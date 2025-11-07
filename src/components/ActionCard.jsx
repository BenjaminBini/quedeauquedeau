import { Card, CardBody, CardFooter, Chip, Link } from '@heroui/react';
import { categoryShortNames } from '../utils/database';

export function ActionCard({ action }) {
  return (
    <Card className="mb-4 border-l-4 border-danger">
      <CardBody>
        <p className="text-sm text-default-500 mb-2 font-semibold">{action.date}</p>
        <h3 className="text-lg font-semibold text-default-900 mb-3 leading-snug">
          {action.title}
        </h3>
        <Link
          href={action.url}
          isExternal
          color="danger"
          className="text-sm font-medium"
          showAnchorIcon
        >
          Read more
        </Link>
      </CardBody>
      <CardFooter className="flex flex-wrap gap-2">
        {action.categories.map((cat, idx) => {
          const shortName = categoryShortNames[cat] || cat;
          return (
            <Chip
              key={idx}
              color="danger"
              variant="flat"
              size="sm"
            >
              {shortName}
            </Chip>
          );
        })}
      </CardFooter>
    </Card>
  );
}
