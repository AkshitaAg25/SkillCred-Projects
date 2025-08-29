export interface Cause {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  goal: number;
  raised: number;
}

export interface DonationDetails {
  name: string;
  email: string;
  amount: number;
  causeTitle: string;
}