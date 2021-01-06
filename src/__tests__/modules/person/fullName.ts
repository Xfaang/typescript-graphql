import { ResolverThis } from '../../../types';
import { Person } from './Person';

export function fullName(this: ResolverThis<Person, any>): string {
  const { firstName, lastName } = this.parent;
  return `${firstName} ${lastName}`;
}
