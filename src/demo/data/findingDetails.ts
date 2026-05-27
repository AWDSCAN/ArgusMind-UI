import { demoFindingDetailFull } from './findingDetailFull';
import { demoFindingDetailsById } from './findingDetailsById';
import { demoFindingsList } from './findings';

export function getDemoFindingDetail(findingId: string) {
  const row =
    demoFindingDetailsById[findingId as keyof typeof demoFindingDetailsById];
  return row ?? null;
}

export function getDemoFindingByNeo4jId(neo4jElementId: string) {
  const listItem = demoFindingsList.find(
    (f) => f.neo4j_element_id === neo4jElementId,
  );
  if (!listItem) return null;
  return getDemoFindingDetail(listItem.id);
}

export { demoFindingDetailFull };
